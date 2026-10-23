import { createHash } from 'node:crypto';
import { mkdir, open, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  P1_T12_BASE64,
  P1_T12_CONTENT_TYPE,
  P1_T12_EXPECTED_SHA256,
  P1_T12_EXPECTED_SIZE,
  P1_T12_EXPIRY_MARGIN_MS,
  P1_T12_FILENAME,
  P1_T12_ZERNIO_MAX,
  P1_T12_CLOUD_PUT_MAX,
  P1_T12_PUBLIC_GET_MAX,
  P1_T12_NETWORK_MAX,
  p1T12Fixture,
} from './p1-t12-runner.js';

export const P1_T12_R01_EVIDENCE_PATH = 'artifacts/provider-spike/p1-t12-r01-evidence.jsonl';
export const P1_T12_R01_PID_PATH = 'artifacts/provider-spike/p1-t12-r01-live.pid';
const API_BASE = 'https://zernio.com/api';
const PARTIAL_RECOMMENDATION = 'Media Upload \u2192 PARTIALLY_VERIFIED \u2014 AWAITING TEAM LEADER REVIEW';
const PENDING_RECOMMENDATION = 'Media Upload remains SPIKE_PENDING';

export type P1T12R01Stage =
  | 'RUN_STARTED'
  | 'IDENTITY_VERIFIED'
  | 'PRESIGN_RECEIVED'
  | 'INITIAL_UPLOAD_COMPLETED'
  | 'PUBLIC_READ_VERIFIED'
  | 'EXPIRY_WAIT_STARTED'
  | 'EXPIRY_DEADLINE_REACHED'
  | 'EXPIRED_PUT_COMPLETED'
  | 'RUN_FINALIZED';

export type P1T12R01Classification =
  | 'TEMP_MEDIA_PRESIGN_UPLOAD_PUBLIC_READ_AND_UPLOAD_URL_EXPIRY_VERIFIED'
  | 'PRESIGNED_UPLOAD_EXPIRY_NOT_ENFORCED_AS_EXPECTED'
  | 'TEMP_MEDIA_UPLOAD_BLOCKED'
  | 'MEDIA_PROVIDER_BEHAVIOR_BLOCKED'
  | 'MEDIA_EVIDENCE_CAPTURE_FAILURE'
  | 'MEDIA_SAFETY_FAILURE';

type Result = 'PASS' | 'BLOCKED' | 'FAIL';
type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type JsonObject = Record<string, unknown>;

export interface SafeCounters {
  zernioApiCalls: number;
  presigns: number;
  initialPuts: number;
  expiredPuts: number;
  publicGets: number;
  networkCalls: number;
  postsSocialMutations: 0;
  retries: 0;
}

export interface EvidenceJournal {
  initialize(): Promise<void>;
  append(stage: P1T12R01Stage, counters: SafeCounters, fields: JsonObject, forbidden: string[]): Promise<void>;
}

export interface PidGuard {
  acquire(): Promise<boolean>;
}

export interface P1T12R01RunOptions {
  live?: boolean;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: FetchLike;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  journal?: EvidenceJournal;
  pidGuard?: PidGuard;
}

export interface P1T12R01RunResult {
  liveEnabled: boolean;
  result: Result;
  classification: P1T12R01Classification;
  errorCategory: string | null;
  recommendation: string;
  asset: { filename: string; contentType: string; size: number; sha256: string; valid: boolean };
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
  initialUpload: { status: number | null; responseByteLength: number | null };
  publicRead: { status: number | null; size: number | null; sha256: string | null; exactMatch: boolean };
  expiry: {
    deadline: string | null;
    elapsedMs: number | null;
    requiredMs: number | null;
    deadlineReached: boolean;
    status: number | null;
    safeErrorCategory: string | null;
    rejected: boolean;
  };
  counters: SafeCounters;
  signedUrlsPersisted: 0;
  secretsPersisted: 0;
  secondPresign: 0;
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
const waitDefault = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function safeExpiryCategory(status: number, body: string) {
  if (is2xx(status)) return null;
  const lower = body.toLowerCase();
  if (lower.includes('request has expired') || lower.includes('requestexpired') || lower.includes('expired')) {
    return 'SIGNED_REQUEST_EXPIRED';
  }
  if (
    lower.includes('signaturedoesnotmatch') ||
    lower.includes('invalidsignature') ||
    lower.includes('authorizationqueryparameterserror') ||
    lower.includes('invalid signature')
  ) {
    return 'SIGNED_REQUEST_INVALID';
  }
  return 'NON_2XX_UNCLASSIFIED';
}

function safeNetworkCategory(error: unknown) {
  if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
    return 'NETWORK_TIMEOUT';
  }
  return 'NETWORK_ERROR';
}

function containsSensitiveMaterial(serialized: string, forbidden: string[]) {
  if (/X-Amz-(?:Signature|Credential|Security-Token)=/i.test(serialized)) return true;
  if (/Authorization\s*[:=]/i.test(serialized)) return true;
  return forbidden.filter(Boolean).some((value) => serialized.includes(value));
}

export class FixedEvidenceJournal implements EvidenceJournal {
  private sequence = 0;
  constructor(private readonly now: () => number = Date.now) {}

  async initialize() {
    await mkdir(dirname(P1_T12_R01_EVIDENCE_PATH), { recursive: true });
    try {
      const handle = await open(P1_T12_R01_EVIDENCE_PATH, 'wx');
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

  async append(stage: P1T12R01Stage, counters: SafeCounters, fields: JsonObject, forbidden: string[]) {
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
      const handle = await open(P1_T12_R01_EVIDENCE_PATH, 'a');
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
    await mkdir(dirname(P1_T12_R01_PID_PATH), { recursive: true });
    try {
      const handle = await open(P1_T12_R01_PID_PATH, 'wx');
      const payload = Buffer.from(
        `${JSON.stringify({
          pid: process.pid,
          startedAt: new Date(this.now()).toISOString(),
          evidencePath: P1_T12_R01_EVIDENCE_PATH,
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

export const readFixedEvidenceText = () => readFile(P1_T12_R01_EVIDENCE_PATH, 'utf8');

export function parseP1T12R01Args(argv: string[]) {
  if (argv.length === 0) return { ok: true as const, live: false };
  if (argv.length === 1 && argv[0] === '--live') return { ok: true as const, live: true };
  return { ok: false as const, live: false };
}

export async function runP1T12R01(options: P1T12R01RunOptions = {}): Promise<P1T12R01RunResult> {
  const live = options.live === true;
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? waitDefault;
  const fixture = p1T12Fixture();
  const asset = {
    filename: P1_T12_FILENAME,
    contentType: P1_T12_CONTENT_TYPE,
    size: fixture.size,
    sha256: fixture.sha256,
    valid: fixture.size === P1_T12_EXPECTED_SIZE && fixture.sha256 === P1_T12_EXPECTED_SHA256,
  };
  let counters: SafeCounters = {
    zernioApiCalls: 0,
    presigns: 0,
    initialPuts: 0,
    expiredPuts: 0,
    publicGets: 0,
    networkCalls: 0,
    postsSocialMutations: 0,
    retries: 0,
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
  const initialUpload = { status: null as number | null, responseByteLength: null as number | null };
  const publicRead = { status: null as number | null, size: null as number | null, sha256: null as string | null, exactMatch: false };
  const expiry = {
    deadline: null as string | null,
    elapsedMs: null as number | null,
    requiredMs: null as number | null,
    deadlineReached: false,
    status: null as number | null,
    safeErrorCategory: null as string | null,
    rejected: false,
  };

  const build = (result: Result, classification: P1T12R01Classification, errorCategory: string | null): P1T12R01RunResult => ({
    liveEnabled: live,
    result,
    classification,
    errorCategory,
    recommendation:
      classification === 'TEMP_MEDIA_PRESIGN_UPLOAD_PUBLIC_READ_AND_UPLOAD_URL_EXPIRY_VERIFIED'
        ? PARTIAL_RECOMMENDATION
        : PENDING_RECOMMENDATION,
    asset,
    identity,
    presign,
    initialUpload,
    publicRead,
    expiry,
    counters: { ...counters },
    signedUrlsPersisted: 0,
    secretsPersisted: 0,
    secondPresign: 0,
    permanentUploads: 0,
  });

  if (!asset.valid) return build('FAIL', 'MEDIA_SAFETY_FAILURE', 'SAFETY_FIXTURE_MISMATCH');
  if (!live) return build('BLOCKED', 'MEDIA_PROVIDER_BEHAVIOR_BLOCKED', 'LIVE_OPT_IN_REQUIRED');

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

  const checkpoint = async (stage: P1T12R01Stage, fields: JsonObject, extra: string[] = []) => {
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
    classification: P1T12R01Classification,
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
          signedUrlsPersisted: 0,
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

  const stopOnCaptureFailure = async (failure: P1T12R01RunResult, extra: string[] = []) => {
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
      // The returned classification already records the evidence-capture failure.
    }
    return failure;
  };

  let failure = await checkpoint('RUN_STARTED', {
    pid: process.pid,
    asset: { filename: asset.filename, contentType: asset.contentType, size: asset.size, sha256: asset.sha256 },
  });
  if (failure) return stopOnCaptureFailure(failure);
  if (!apiKey || !expectedEmail) {
    return finalize('BLOCKED', 'MEDIA_PROVIDER_BEHAVIOR_BLOCKED', 'MISSING_LIVE_CREDENTIAL_OR_EXPECTED_IDENTITY');
  }

  const zernio = async (path: string, init: RequestInit) => {
    if (counters.zernioApiCalls >= P1_T12_ZERNIO_MAX || counters.networkCalls >= P1_T12_NETWORK_MAX) {
      throw new Error('SAFETY_REQUEST_CEILING_VIOLATION');
    }
    if (path !== '/v1/auth/verify' && path !== '/v1/media/presign') {
      throw new Error('SAFETY_ENDPOINT_NOT_AUTHORIZED');
    }
    if (path === '/v1/media/presign' && counters.presigns >= 1) {
      throw new Error('SAFETY_SECOND_PRESIGN_ATTEMPT');
    }
    counters.zernioApiCalls++;
    counters.networkCalls++;
    if (path === '/v1/media/presign') counters.presigns++;
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${apiKey}`);
    headers.set('Accept', 'application/json');
    return fetchImpl(`${API_BASE}${path}`, { ...init, headers, signal: AbortSignal.timeout(10_000) });
  };

  const cloudPut = async (url: string, expired: boolean) => {
    if (counters.initialPuts + counters.expiredPuts >= P1_T12_CLOUD_PUT_MAX || counters.networkCalls >= P1_T12_NETWORK_MAX) {
      throw new Error('SAFETY_REQUEST_CEILING_VIOLATION');
    }
    if (expired) counters.expiredPuts++;
    else counters.initialPuts++;
    counters.networkCalls++;
    return fetchImpl(url, {
      method: 'PUT',
      headers: { 'Content-Type': P1_T12_CONTENT_TYPE },
      body: Buffer.from(P1_T12_BASE64, 'base64'),
      signal: AbortSignal.timeout(15_000),
    });
  };

  const publicGet = async (url: string) => {
    if (counters.publicGets >= P1_T12_PUBLIC_GET_MAX || counters.networkCalls >= P1_T12_NETWORK_MAX) {
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
    if (auth.status !== 200) return finalize('BLOCKED', 'MEDIA_PROVIDER_BEHAVIOR_BLOCKED', `IDENTITY_HTTP_${auth.status}`);
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
    if (pre.status !== 200) return finalize('BLOCKED', 'MEDIA_PROVIDER_BEHAVIOR_BLOCKED', `PRESIGN_HTTP_${pre.status}`);
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
    if (!uploadUrl || !publicUrl || !key || !expiresIn) {
      return finalize('BLOCKED', 'MEDIA_PROVIDER_BEHAVIOR_BLOCKED', 'PRESIGN_RESPONSE_INCOMPLETE', [uploadUrl]);
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
      'PRESIGN_RECEIVED',
      {
        httpStatus: pre.status,
        requestId: presign.requestId,
        expiresIn,
        issuedAt: presign.issuedAt,
        key,
        keyPrefix: presign.keyPrefix,
        uploadScheme: presign.uploadScheme,
        uploadHostname: presign.uploadHostname,
        signedQueryPresent: true,
        publicScheme: presign.publicScheme,
        publicHostname: presign.publicHostname,
        publicPath: presign.publicPath,
      },
      [uploadUrl],
    );
    if (failure) return stopOnCaptureFailure(failure, [uploadUrl]);

    const firstPut = await cloudPut(uploadUrl, false);
    initialUpload.status = firstPut.status;
    initialUpload.responseByteLength = Buffer.byteLength(await firstPut.text());
    failure = await checkpoint(
      'INITIAL_UPLOAD_COMPLETED',
      {
        httpStatus: firstPut.status,
        responseByteLength: initialUpload.responseByteLength,
        uploadAttemptCount: counters.initialPuts,
      },
      [uploadUrl],
    );
    if (failure) return stopOnCaptureFailure(failure, [uploadUrl]);
    if (!is2xx(firstPut.status)) {
      return finalize('BLOCKED', 'TEMP_MEDIA_UPLOAD_BLOCKED', `INITIAL_PUT_HTTP_${firstPut.status}`, [uploadUrl]);
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
      return finalize('BLOCKED', 'TEMP_MEDIA_UPLOAD_BLOCKED', `PUBLIC_READ_HTTP_${read.status}`, [uploadUrl]);
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
      return finalize('BLOCKED', 'TEMP_MEDIA_UPLOAD_BLOCKED', 'PUBLIC_BINARY_MISMATCH', [uploadUrl]);
    }

    const requiredMs = expiresIn * 1000 + P1_T12_EXPIRY_MARGIN_MS;
    const deadlineMs = issuedMs + requiredMs;
    expiry.requiredMs = requiredMs;
    expiry.deadline = new Date(deadlineMs).toISOString();
    failure = await checkpoint(
      'EXPIRY_WAIT_STARTED',
      {
        issuedAt: presign.issuedAt,
        expiresIn,
        calculatedDeadline: expiry.deadline,
        safetyMarginMs: P1_T12_EXPIRY_MARGIN_MS,
      },
      [uploadUrl],
    );
    if (failure) return stopOnCaptureFailure(failure, [uploadUrl]);
    const waitMs = Math.max(0, deadlineMs - now());
    if (waitMs > 0) await sleep(waitMs);

    expiry.elapsedMs = now() - issuedMs;
    expiry.deadlineReached = expiry.elapsedMs >= requiredMs;
    failure = await checkpoint(
      'EXPIRY_DEADLINE_REACHED',
      {
        currentUtc: new Date(now()).toISOString(),
        elapsedMs: expiry.elapsedMs,
        requiredExpiryPlusMarginMs: requiredMs,
        deadlineReached: expiry.deadlineReached,
      },
      [uploadUrl],
    );
    if (failure) return stopOnCaptureFailure(failure, [uploadUrl]);
    if (!expiry.deadlineReached) {
      return finalize('FAIL', 'MEDIA_SAFETY_FAILURE', 'SAFETY_EXPIRY_DEADLINE_NOT_REACHED', [uploadUrl]);
    }

    const expiredPut = await cloudPut(uploadUrl, true);
    expiry.status = expiredPut.status;
    expiry.safeErrorCategory = safeExpiryCategory(expiredPut.status, await expiredPut.text());
    expiry.rejected =
      !is2xx(expiredPut.status) &&
      (expiry.safeErrorCategory === 'SIGNED_REQUEST_EXPIRED' || expiry.safeErrorCategory === 'SIGNED_REQUEST_INVALID');
    failure = await checkpoint(
      'EXPIRED_PUT_COMPLETED',
      {
        httpStatus: expiredPut.status,
        safeErrorCategory: expiry.safeErrorCategory,
        rejected: expiry.rejected,
        putAttemptCount: counters.initialPuts + counters.expiredPuts,
        expiredPutAttemptCount: counters.expiredPuts,
      },
      [uploadUrl],
    );
    if (failure) return stopOnCaptureFailure(failure, [uploadUrl]);

    if (is2xx(expiredPut.status)) {
      return finalize(
        'FAIL',
        'PRESIGNED_UPLOAD_EXPIRY_NOT_ENFORCED_AS_EXPECTED',
        'EXPIRED_PUT_SUCCEEDED',
        [uploadUrl],
      );
    }
    if (!expiry.rejected) {
      return finalize('BLOCKED', 'MEDIA_PROVIDER_BEHAVIOR_BLOCKED', 'NON_2XX_UNCLASSIFIED', [uploadUrl]);
    }
    return finalize(
      'PASS',
      'TEMP_MEDIA_PRESIGN_UPLOAD_PUBLIC_READ_AND_UPLOAD_URL_EXPIRY_VERIFIED',
      null,
      [uploadUrl],
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('SAFETY_')) {
      return finalize('FAIL', 'MEDIA_SAFETY_FAILURE', message, [uploadUrl]);
    }
    return finalize('BLOCKED', 'MEDIA_PROVIDER_BEHAVIOR_BLOCKED', safeNetworkCategory(error), [uploadUrl]);
  }
}

async function main() {
  const parsed = parseP1T12R01Args(process.argv.slice(2));
  if (!parsed.ok) {
    console.log(
      JSON.stringify({
        liveEnabled: false,
        result: 'FAIL',
        classification: 'MEDIA_SAFETY_FAILURE',
        errorCategory: 'SAFETY_INVALID_P1_T12_R01_ARGUMENTS',
      }),
    );
    process.exitCode = 1;
    return;
  }
  const result = await runP1T12R01({ live: parsed.live, env: process.env });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.result === 'PASS' ? 0 : result.result === 'BLOCKED' ? 2 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
