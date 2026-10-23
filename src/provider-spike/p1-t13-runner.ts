import { createHash } from 'node:crypto';
import { mkdir, open, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  P1_T12_BASE64,
  P1_T12_CONTENT_TYPE,
  P1_T12_EXPECTED_SHA256,
  P1_T12_EXPECTED_SIZE,
  P1_T12_FILENAME,
  p1T12Fixture,
} from './p1-t12-runner.js';

export const P1_T13_EVIDENCE_PATH = 'artifacts/provider-spike/p1-t13-evidence.jsonl';
export const P1_T13_PID_PATH = 'artifacts/provider-spike/p1-t13-live.pid';
export const P1_T13_ZERNIO_MAX = 2;
export const P1_T13_CLOUD_PUT_MAX = 1;
export const P1_T13_PUBLIC_GET_MAX = 1;
export const P1_T13_NETWORK_MAX = 4;

const API_BASE = 'https://zernio.com/api';
const PASS_RECOMMENDATION =
  'Media Upload remains PARTIALLY_VERIFIED — approved-original re-upload verified; retention/deletion is the only remaining Media Phase-1 gap — AWAITING TEAM LEADER REVIEW';
const PENDING_RECOMMENDATION = 'Media Upload remains PARTIALLY_VERIFIED — AWAITING TEAM LEADER REVIEW';

export type P1T13Stage =
  | 'RUN_STARTED'
  | 'IDENTITY_VERIFIED'
  | 'FRESH_PRESIGN_RECEIVED'
  | 'REUPLOAD_COMPLETED'
  | 'PUBLIC_READ_VERIFIED'
  | 'RUN_FINALIZED';

export type P1T13Classification =
  | 'APPROVED_ORIGINAL_FRESH_PRESIGN_REUPLOAD_VERIFIED'
  | 'APPROVED_ORIGINAL_REUPLOAD_BLOCKED'
  | 'FRESH_MEDIA_PRESIGN_BLOCKED'
  | 'MEDIA_EVIDENCE_CAPTURE_FAILURE'
  | 'MEDIA_SAFETY_FAILURE';

type Result = 'PASS' | 'BLOCKED' | 'FAIL';
type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type JsonObject = Record<string, unknown>;

export interface P1T13Counters {
  zernioApiCalls: number;
  freshPresigns: number;
  cloudPuts: number;
  publicGets: number;
  networkCalls: number;
  secondPresign: 0;
  retries: 0;
  socialMutations: 0;
}

export interface EvidenceJournal {
  initialize(): Promise<void>;
  append(stage: P1T13Stage, counters: P1T13Counters, fields: JsonObject, forbidden: string[]): Promise<void>;
}

export interface PidGuard {
  acquire(): Promise<boolean>;
}

export interface P1T13RunOptions {
  live?: boolean;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: FetchLike;
  now?: () => number;
  journal?: EvidenceJournal;
  pidGuard?: PidGuard;
}

export interface P1T13RunResult {
  liveEnabled: boolean;
  result: Result;
  classification: P1T13Classification;
  errorCategory: string | null;
  recommendation: string;
  asset: { filename: string; contentType: string; size: number; sha256: string; valid: boolean; source: 'RETAINED_FROZEN_ORIGINAL' };
  identity: { status: number | null; requestId: string | null; match: boolean };
  presign: {
    status: number | null;
    requestId: string | null;
    expiresIn: number | null;
    issuedAt: string | null;
    key: string | null;
    keyPrefix: string | null;
    uploadScheme: string | null;
    uploadHostname: string | null;
    signedQueryPresent: boolean;
    publicScheme: string | null;
    publicHostname: string | null;
    publicPath: string | null;
  };
  reupload: { status: number | null; responseByteLength: number | null };
  publicRead: { status: number | null; size: number | null; sha256: string | null; exactMatch: boolean };
  counters: P1T13Counters;
  fullSignedUrlPersisted: 0;
  signedQueryPersisted: 0;
  secretsPersisted: 0;
  permanentUploads: 0;
}

class JournalError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

const obj = (value: unknown): JsonObject | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as JsonObject) : null;
const text = (value: unknown) => (typeof value === 'string' && value.length ? value : null);
const positive = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
const requestId = (response: Response) =>
  response.headers.get('x-request-id') ?? response.headers.get('x-correlation-id');
const is2xx = (status: number) => status >= 200 && status < 300;
const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const keyPrefix = (key: string) => {
  const parts = key.split('/').filter(Boolean);
  return parts.length ? `${parts[0]}/` : null;
};
const normalizePresign = (body: unknown) => {
  const root = obj(body);
  return obj(root?.data) ?? root;
};

function safeNetworkCategory(error: unknown) {
  if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
    return 'NETWORK_TIMEOUT';
  }
  return 'NETWORK_ERROR';
}

function containsSensitiveMaterial(serialized: string, forbidden: string[]) {
  if (/X-Amz-(?:Algorithm|Credential|Date|Expires|SignedHeaders|Signature|Security-Token)=/i.test(serialized)) return true;
  if (/Authorization\s*[:=]/i.test(serialized)) return true;
  if (/Bearer\s+[A-Za-z0-9._~+\/-]+/i.test(serialized)) return true;
  return forbidden.filter(Boolean).some((value) => serialized.includes(value));
}

export class FixedEvidenceJournal implements EvidenceJournal {
  private sequence = 0;
  constructor(private readonly now: () => number = Date.now) {}

  async initialize() {
    await mkdir(dirname(P1_T13_EVIDENCE_PATH), { recursive: true });
    try {
      const handle = await open(P1_T13_EVIDENCE_PATH, 'wx');
      await handle.sync();
      await handle.close();
    } catch (error) {
      throw new JournalError(
        (error as NodeJS.ErrnoException).code === 'EEXIST'
          ? 'SAFETY_EVIDENCE_FILE_ALREADY_EXISTS'
          : 'EVIDENCE_FILE_INIT_FAILED',
      );
    }
  }

  async append(stage: P1T13Stage, counters: P1T13Counters, fields: JsonObject, forbidden: string[]) {
    const line = JSON.stringify({
      sequence: ++this.sequence,
      utcTimestamp: new Date(this.now()).toISOString(),
      stage,
      counters: { ...counters },
      ...fields,
    });
    if (containsSensitiveMaterial(line, forbidden)) {
      throw new JournalError('SAFETY_EVIDENCE_SECRET_LEAK_PREVENTED');
    }
    try {
      const handle = await open(P1_T13_EVIDENCE_PATH, 'a');
      const payload = Buffer.from(`${line}\n`, 'utf8');
      const writeResult = await handle.write(payload, 0, payload.length, null);
      if (writeResult.bytesWritten !== payload.length) {
        await handle.close();
        throw new JournalError('EVIDENCE_PARTIAL_WRITE');
      }
      await handle.sync();
      await handle.close();
    } catch (error) {
      if (error instanceof JournalError) throw error;
      throw new JournalError('EVIDENCE_WRITE_FAILED');
    }
  }
}

export class FixedPidGuard implements PidGuard {
  constructor(private readonly now: () => number = Date.now) {}
  async acquire() {
    await mkdir(dirname(P1_T13_PID_PATH), { recursive: true });
    try {
      const handle = await open(P1_T13_PID_PATH, 'wx');
      const payload = Buffer.from(
        `${JSON.stringify({
          pid: process.pid,
          startedAt: new Date(this.now()).toISOString(),
          evidencePath: P1_T13_EVIDENCE_PATH,
        })}\n`,
        'utf8',
      );
      const writeResult = await handle.write(payload, 0, payload.length, null);
      if (writeResult.bytesWritten !== payload.length) {
        await handle.close();
        return false;
      }
      await handle.sync();
      await handle.close();
      return true;
    } catch {
      return false;
    }
  }
}

export const readFixedEvidenceText = () => readFile(P1_T13_EVIDENCE_PATH, 'utf8');

export function parseP1T13Args(argv: string[]) {
  if (argv.length === 0) return { ok: true as const, live: false };
  if (argv.length === 1 && argv[0] === '--live') return { ok: true as const, live: true };
  return { ok: false as const, live: false };
}

export async function runP1T13(options: P1T13RunOptions = {}): Promise<P1T13RunResult> {
  const live = options.live === true;
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const fixture = p1T12Fixture();
  const asset = {
    filename: P1_T12_FILENAME,
    contentType: P1_T12_CONTENT_TYPE,
    size: fixture.size,
    sha256: fixture.sha256,
    valid: fixture.size === P1_T12_EXPECTED_SIZE && fixture.sha256 === P1_T12_EXPECTED_SHA256,
    source: 'RETAINED_FROZEN_ORIGINAL' as const,
  };
  let counters: P1T13Counters = {
    zernioApiCalls: 0,
    freshPresigns: 0,
    cloudPuts: 0,
    publicGets: 0,
    networkCalls: 0,
    secondPresign: 0,
    retries: 0,
    socialMutations: 0,
  };
  const identity = { status: null as number | null, requestId: null as string | null, match: false };
  const presign = {
    status: null as number | null,
    requestId: null as string | null,
    expiresIn: null as number | null,
    issuedAt: null as string | null,
    key: null as string | null,
    keyPrefix: null as string | null,
    uploadScheme: null as string | null,
    uploadHostname: null as string | null,
    signedQueryPresent: false,
    publicScheme: null as string | null,
    publicHostname: null as string | null,
    publicPath: null as string | null,
  };
  const reupload = { status: null as number | null, responseByteLength: null as number | null };
  const publicRead = { status: null as number | null, size: null as number | null, sha256: null as string | null, exactMatch: false };

  const build = (result: Result, classification: P1T13Classification, errorCategory: string | null): P1T13RunResult => ({
    liveEnabled: live,
    result,
    classification,
    errorCategory,
    recommendation:
      classification === 'APPROVED_ORIGINAL_FRESH_PRESIGN_REUPLOAD_VERIFIED'
        ? PASS_RECOMMENDATION
        : PENDING_RECOMMENDATION,
    asset,
    identity,
    presign,
    reupload,
    publicRead,
    counters: { ...counters },
    fullSignedUrlPersisted: 0,
    signedQueryPersisted: 0,
    secretsPersisted: 0,
    permanentUploads: 0,
  });

  if (!asset.valid) return build('FAIL', 'MEDIA_SAFETY_FAILURE', 'SAFETY_FIXTURE_MISMATCH');
  if (!live) return build('BLOCKED', 'FRESH_MEDIA_PRESIGN_BLOCKED', 'LIVE_OPT_IN_REQUIRED');

  const journal = options.journal ?? new FixedEvidenceJournal(now);
  const pidGuard = options.pidGuard ?? new FixedPidGuard(now);
  if (!(await pidGuard.acquire())) {
    return build('FAIL', 'MEDIA_SAFETY_FAILURE', 'SAFETY_DUPLICATE_LIVE_LAUNCH_OR_STALE_PID');
  }
  try {
    await journal.initialize();
  } catch (error) {
    const code = error instanceof JournalError ? error.code : 'EVIDENCE_FILE_INIT_FAILED';
    return build('FAIL', code.startsWith('SAFETY_') ? 'MEDIA_SAFETY_FAILURE' : 'MEDIA_EVIDENCE_CAPTURE_FAILURE', code);
  }

  const apiKey = env.ZERNIO_API_KEY ?? '';
  const expectedEmail = env.ZERNIO_EXPECTED_USER_EMAIL?.trim().toLowerCase() ?? '';
  const forbidden = (extra: string[] = []) => [apiKey, expectedEmail, ...extra];

  const checkpoint = async (stage: P1T13Stage, fields: JsonObject, extra: string[] = []) => {
    try {
      await journal.append(stage, counters, fields, forbidden(extra));
      return null;
    } catch (error) {
      const code = error instanceof JournalError ? error.code : 'EVIDENCE_WRITE_FAILED';
      return build(
        'FAIL',
        code.startsWith('SAFETY_') ? 'MEDIA_SAFETY_FAILURE' : 'MEDIA_EVIDENCE_CAPTURE_FAILURE',
        code,
      );
    }
  };

  const finalize = async (
    result: Result,
    classification: P1T13Classification,
    errorCategory: string | null,
    extra: string[] = [],
  ) => {
    const output = build(result, classification, errorCategory);
    try {
      await journal.append(
        'RUN_FINALIZED',
        counters,
        {
          result,
          classification,
          errorCategory,
          recommendation: output.recommendation,
          fullSignedUrlPersisted: 0,
          signedQueryPersisted: 0,
          secretsPersisted: 0,
          secondPresign: 0,
          permanentUploads: 0,
        },
        forbidden(extra),
      );
      return output;
    } catch (error) {
      const code = error instanceof JournalError ? error.code : 'EVIDENCE_FINALIZE_WRITE_FAILED';
      return build(
        'FAIL',
        code.startsWith('SAFETY_') ? 'MEDIA_SAFETY_FAILURE' : 'MEDIA_EVIDENCE_CAPTURE_FAILURE',
        code,
      );
    }
  };

  const stopOnCaptureFailure = async (failure: P1T13RunResult, extra: string[] = []) => {
    try {
      await journal.append(
        'RUN_FINALIZED',
        counters,
        {
          result: failure.result,
          classification: failure.classification,
          errorCategory: failure.errorCategory,
          recommendation: failure.recommendation,
        },
        forbidden(extra),
      );
    } catch {
      // Returned classification already records the capture failure.
    }
    return failure;
  };

  let failure = await checkpoint('RUN_STARTED', {
    pid: process.pid,
    asset: {
      filename: asset.filename,
      contentType: asset.contentType,
      size: asset.size,
      sha256: asset.sha256,
      source: asset.source,
    },
  });
  if (failure) return stopOnCaptureFailure(failure);
  if (!apiKey || !expectedEmail) {
    return finalize('FAIL', 'MEDIA_SAFETY_FAILURE', 'SAFETY_MISSING_LIVE_CREDENTIAL_OR_EXPECTED_IDENTITY');
  }

  const zernio = async (path: string, init: RequestInit) => {
    if (counters.zernioApiCalls >= P1_T13_ZERNIO_MAX || counters.networkCalls >= P1_T13_NETWORK_MAX) {
      throw new Error('SAFETY_REQUEST_CEILING_VIOLATION');
    }
    if (path !== '/v1/auth/verify' && path !== '/v1/media/presign') {
      throw new Error('SAFETY_ENDPOINT_NOT_AUTHORIZED');
    }
    if (path === '/v1/media/presign' && counters.freshPresigns >= 1) {
      throw new Error('SAFETY_SECOND_PRESIGN_ATTEMPT');
    }
    counters.zernioApiCalls++;
    counters.networkCalls++;
    if (path === '/v1/media/presign') counters.freshPresigns++;
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${apiKey}`);
    headers.set('Accept', 'application/json');
    return fetchImpl(`${API_BASE}${path}`, { ...init, headers, signal: AbortSignal.timeout(10_000) });
  };

  const cloudPut = async (url: string) => {
    if (counters.cloudPuts >= P1_T13_CLOUD_PUT_MAX || counters.networkCalls >= P1_T13_NETWORK_MAX) {
      throw new Error('SAFETY_REQUEST_CEILING_VIOLATION');
    }
    counters.cloudPuts++;
    counters.networkCalls++;
    return fetchImpl(url, {
      method: 'PUT',
      headers: { 'Content-Type': P1_T12_CONTENT_TYPE },
      body: Buffer.from(P1_T12_BASE64, 'base64'),
      signal: AbortSignal.timeout(15_000),
    });
  };

  const publicGet = async (url: string) => {
    if (counters.publicGets >= P1_T13_PUBLIC_GET_MAX || counters.networkCalls >= P1_T13_NETWORK_MAX) {
      throw new Error('SAFETY_REQUEST_CEILING_VIOLATION');
    }
    counters.publicGets++;
    counters.networkCalls++;
    return fetchImpl(url, { method: 'GET', signal: AbortSignal.timeout(15_000) });
  };

  let uploadUrl = '';
  try {
    const auth = await zernio('/v1/auth/verify', { method: 'GET' });
    identity.status = auth.status;
    identity.requestId = requestId(auth);
    if (auth.status !== 200) {
      return finalize('BLOCKED', 'FRESH_MEDIA_PRESIGN_BLOCKED', `IDENTITY_HTTP_${auth.status}`);
    }
    const authBody = obj(await auth.json());
    identity.match = Boolean(authBody?.valid === true && text(authBody?.email)?.trim().toLowerCase() === expectedEmail);
    if (!identity.match) return finalize('FAIL', 'MEDIA_SAFETY_FAILURE', 'SAFETY_IDENTITY_MISMATCH');
    failure = await checkpoint('IDENTITY_VERIFIED', {
      httpStatus: auth.status,
      requestId: identity.requestId,
      expectedIdentityMatch: true,
    });
    if (failure) return stopOnCaptureFailure(failure);

    const pre = await zernio('/v1/media/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: P1_T12_FILENAME, contentType: P1_T12_CONTENT_TYPE, size: P1_T12_EXPECTED_SIZE }),
    });
    presign.status = pre.status;
    presign.requestId = requestId(pre);
    if (!is2xx(pre.status)) {
      return finalize('BLOCKED', 'FRESH_MEDIA_PRESIGN_BLOCKED', `PRESIGN_HTTP_${pre.status}`);
    }
    const issuedMs = now();
    const data = normalizePresign(await pre.json());
    uploadUrl = text(data?.uploadUrl) ?? '';
    const publicUrl = text(data?.publicUrl);
    const key = text(data?.key);
    const expiresIn = positive(data?.expiresIn);
    presign.issuedAt = new Date(issuedMs).toISOString();
    presign.expiresIn = expiresIn;
    presign.key = key;
    presign.keyPrefix = key ? keyPrefix(key) : null;
    if (!uploadUrl || !publicUrl || !key || !expiresIn || !presign.requestId) {
      return finalize('BLOCKED', 'FRESH_MEDIA_PRESIGN_BLOCKED', 'PRESIGN_RESPONSE_INCOMPLETE', [uploadUrl]);
    }

    let upload: URL;
    let publicTarget: URL;
    try {
      upload = new URL(uploadUrl);
      publicTarget = new URL(publicUrl);
    } catch {
      return finalize('FAIL', 'MEDIA_SAFETY_FAILURE', 'SAFETY_UNEXPECTED_PRESIGN_URL', [uploadUrl]);
    }
    presign.uploadScheme = upload.protocol;
    presign.uploadHostname = upload.hostname;
    presign.signedQueryPresent = [...upload.searchParams.keys()].length > 0;
    presign.publicScheme = publicTarget.protocol;
    presign.publicHostname = publicTarget.hostname;
    presign.publicPath = publicTarget.pathname;
    const uploadPath = decodeURIComponent(upload.pathname);
    const publicPath = decodeURIComponent(publicTarget.pathname);
    if (
      upload.protocol !== 'https:' ||
      publicTarget.protocol !== 'https:' ||
      !upload.hostname.endsWith('.r2.cloudflarestorage.com') ||
      publicTarget.hostname !== 'media.zernio.com' ||
      !presign.signedQueryPresent ||
      !key.startsWith('temp/') ||
      !key.endsWith(P1_T12_FILENAME) ||
      !uploadPath.endsWith(`/${key}`) ||
      publicPath !== `/${key}`
    ) {
      return finalize('FAIL', 'MEDIA_SAFETY_FAILURE', 'SAFETY_UNEXPECTED_PRESIGN_TARGET', [uploadUrl]);
    }

    failure = await checkpoint(
      'FRESH_PRESIGN_RECEIVED',
      {
        httpStatus: pre.status,
        requestId: presign.requestId,
        issuedAt: presign.issuedAt,
        expiresIn,
        key,
        keyPrefix: presign.keyPrefix,
        uploadScheme: presign.uploadScheme,
        uploadHostname: presign.uploadHostname,
        signedQueryPresent: true,
        publicScheme: presign.publicScheme,
        publicHostname: presign.publicHostname,
        publicPath: presign.publicPath,
        freshAuthorizationIssued: true,
      },
      [uploadUrl],
    );
    if (failure) return stopOnCaptureFailure(failure, [uploadUrl]);

    const put = await cloudPut(uploadUrl);
    reupload.status = put.status;
    reupload.responseByteLength = Buffer.byteLength(await put.text());
    failure = await checkpoint(
      'REUPLOAD_COMPLETED',
      {
        httpStatus: put.status,
        responseByteLength: reupload.responseByteLength,
        putAttemptCount: counters.cloudPuts,
        sourceOriginalSize: asset.size,
        sourceOriginalSha256: asset.sha256,
      },
      [uploadUrl],
    );
    if (failure) return stopOnCaptureFailure(failure, [uploadUrl]);
    if (!is2xx(put.status)) {
      return finalize('BLOCKED', 'APPROVED_ORIGINAL_REUPLOAD_BLOCKED', `REUPLOAD_HTTP_${put.status}`, [uploadUrl]);
    }

    const read = await publicGet(publicUrl);
    publicRead.status = read.status;
    if (!is2xx(read.status)) {
      failure = await checkpoint(
        'PUBLIC_READ_VERIFIED',
        { httpStatus: read.status, downloadedByteCount: null, sha256: null, exactMatch: false },
        [uploadUrl],
      );
      if (failure) return stopOnCaptureFailure(failure, [uploadUrl]);
      return finalize('BLOCKED', 'APPROVED_ORIGINAL_REUPLOAD_BLOCKED', `PUBLIC_READ_HTTP_${read.status}`, [uploadUrl]);
    }
    const downloaded = new Uint8Array(await read.arrayBuffer());
    publicRead.size = downloaded.length;
    publicRead.sha256 = sha256(downloaded);
    publicRead.exactMatch = downloaded.length === P1_T12_EXPECTED_SIZE && publicRead.sha256 === P1_T12_EXPECTED_SHA256;
    failure = await checkpoint(
      'PUBLIC_READ_VERIFIED',
      {
        httpStatus: read.status,
        downloadedByteCount: publicRead.size,
        sha256: publicRead.sha256,
        exactMatch: publicRead.exactMatch,
      },
      [uploadUrl],
    );
    if (failure) return stopOnCaptureFailure(failure, [uploadUrl]);
    if (!publicRead.exactMatch) {
      return finalize('BLOCKED', 'APPROVED_ORIGINAL_REUPLOAD_BLOCKED', 'PUBLIC_BINARY_MISMATCH', [uploadUrl]);
    }

    return finalize('PASS', 'APPROVED_ORIGINAL_FRESH_PRESIGN_REUPLOAD_VERIFIED', null, [uploadUrl]);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('SAFETY_')) {
      return finalize('FAIL', 'MEDIA_SAFETY_FAILURE', message, [uploadUrl]);
    }
    const classification = counters.freshPresigns > 0 ? 'APPROVED_ORIGINAL_REUPLOAD_BLOCKED' : 'FRESH_MEDIA_PRESIGN_BLOCKED';
    return finalize('BLOCKED', classification, safeNetworkCategory(error), [uploadUrl]);
  }
}

async function main() {
  const parsed = parseP1T13Args(process.argv.slice(2));
  if (!parsed.ok) {
    console.log(
      JSON.stringify({
        liveEnabled: false,
        result: 'FAIL',
        classification: 'MEDIA_SAFETY_FAILURE',
        errorCategory: 'SAFETY_INVALID_P1_T13_ARGUMENTS',
      }),
    );
    process.exitCode = 1;
    return;
  }
  const result = await runP1T13({ live: parsed.live, env: process.env });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.result === 'PASS' ? 0 : result.result === 'BLOCKED' ? 2 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
