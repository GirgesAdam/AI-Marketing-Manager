import { createHash } from 'node:crypto';
import { mkdir, open, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { P1_T12_EXPECTED_SHA256, P1_T12_EXPECTED_SIZE } from './p1-t12-runner.js';

export const P1_T14_BASELINE_PATH = 'artifacts/provider-spike/p1-t13-evidence.jsonl';
export const P1_T14_EVIDENCE_PATH = 'artifacts/provider-spike/p1-t14-evidence.jsonl';
export const P1_T14_TARGET_URL =
  'https://media.zernio.com/temp/1792767679997_dncsau4l_marketlyai-p1-t12-fixture.png';
export const P1_T14_OBSERVATION_A_OFFSET_MS = (7 * 24 + 1) * 60 * 60 * 1000;
export const P1_T14_OBSERVATION_B_OFFSET_MS = (8 * 24 + 6) * 60 * 60 * 1000;
export const P1_T14_TOTAL_GET_MAX = 2;
export const P1_T14_TIMEOUT_MS = 10_000;

export type P1T14Mode = 'A' | 'B';
export type P1T14Stage =
  | 'RETENTION_BASELINE_LOADED'
  | 'OBSERVATION_A_STARTED'
  | 'OBSERVATION_A_COMPLETED'
  | 'OBSERVATION_B_STARTED'
  | 'OBSERVATION_B_COMPLETED'
  | 'RUN_FINALIZED';

export type P1T14Classification =
  | 'TEMPORARY_MEDIA_AUTO_DELETION_VERIFIED'
  | 'TEMPORARY_MEDIA_STILL_PRESENT_AFTER_DOCUMENTED_RETENTION_WINDOW'
  | 'RETENTION_OBSERVATION_BLOCKED'
  | 'RETENTION_BASELINE_EVIDENCE_UNAVAILABLE'
  | 'MEDIA_RETENTION_SAFETY_FAILURE';

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type JsonObject = Record<string, unknown>;

export interface P1T14EvidenceRow extends JsonObject {
  stage: P1T14Stage;
}

export interface P1T14Journal {
  initializeForA(): Promise<void>;
  readRows(): Promise<P1T14EvidenceRow[]>;
  append(stage: P1T14Stage, fields: JsonObject): Promise<void>;
}

export interface P1T14RunOptions {
  mode: P1T14Mode | null;
  now?: () => number;
  fetchImpl?: FetchLike;
  journal?: P1T14Journal;
  baselineText?: string;
}

export interface P1T14RunResult {
  result: 'PASS' | 'PENDING' | 'BLOCKED' | 'FAIL';
  classification: P1T14Classification | null;
  errorCategory: string | null;
  mode: P1T14Mode | null;
  targetUrl: typeof P1_T14_TARGET_URL;
  fixtureUploadedAt: string | null;
  eligibleAt: string | null;
  observedAt: string | null;
  ageMs: number | null;
  httpStatus: number | null;
  responseByteCount: number | null;
  sha256: string | null;
  exactMatch: boolean | null;
  absenceCategory: string | null;
  publicGetsThisRun: number;
  totalPublicGetsObserved: number;
  retries: 0;
  credentialsUsed: 0;
  providerMutations: 0;
  recommendation: string | null;
}

const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const asObject = (value: unknown) =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

function parseJsonl(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return trimmed.split(/\r?\n/).map((line) => JSON.parse(line) as Record<string, unknown>);
}

export function parseP1T14Args(argv: string[]) {
  if (argv.length === 0) return { ok: true as const, mode: null };
  if (argv.length !== 1) return { ok: false as const, mode: null };
  if (argv[0] === '--observe-a') return { ok: true as const, mode: 'A' as const };
  if (argv[0] === '--observe-b') return { ok: true as const, mode: 'B' as const };
  return { ok: false as const, mode: null };
}

export function readAcceptedBaseline(text: string) {
  try {
    const rows = parseJsonl(text);
    const stages = rows.map((row) => row.stage);
    const expected = [
      'RUN_STARTED',
      'IDENTITY_VERIFIED',
      'FRESH_PRESIGN_RECEIVED',
      'REUPLOAD_COMPLETED',
      'PUBLIC_READ_VERIFIED',
      'RUN_FINALIZED',
    ];
    if (JSON.stringify(stages) !== JSON.stringify(expected)) return null;
    const reupload = rows[3];
    const publicRead = rows[4];
    const timestamp = typeof reupload?.utcTimestamp === 'string' ? reupload.utcTimestamp : null;
    if (!timestamp || !Number.isFinite(Date.parse(timestamp))) return null;
    if (publicRead?.httpStatus !== 200) return null;
    if (publicRead?.downloadedByteCount !== P1_T12_EXPECTED_SIZE) return null;
    if (publicRead?.sha256 !== P1_T12_EXPECTED_SHA256) return null;
    if (publicRead?.exactMatch !== true) return null;
    return {
      fixtureUploadedAt: timestamp,
      fixtureUploadedAtMs: Date.parse(timestamp),
    };
  } catch {
    return null;
  }
}

export class FixedP1T14Journal implements P1T14Journal {
  constructor(private readonly now: () => number = Date.now) {}

  async initializeForA() {
    await mkdir(dirname(P1_T14_EVIDENCE_PATH), { recursive: true });
    const handle = await open(P1_T14_EVIDENCE_PATH, 'wx');
    await handle.sync();
    await handle.close();
  }

  async readRows() {
    const text = await readFile(P1_T14_EVIDENCE_PATH, 'utf8');
    return parseJsonl(text) as P1T14EvidenceRow[];
  }

  async append(stage: P1T14Stage, fields: JsonObject) {
    const line = JSON.stringify({
      utcTimestamp: new Date(this.now()).toISOString(),
      stage,
      ...fields,
    });
    const handle = await open(P1_T14_EVIDENCE_PATH, 'a');
    const payload = Buffer.from(`${line}\n`, 'utf8');
    const written = await handle.write(payload, 0, payload.length, null);
    if (written.bytesWritten !== payload.length) {
      await handle.close();
      throw new Error('EVIDENCE_PARTIAL_WRITE');
    }
    await handle.sync();
    await handle.close();
  }
}

function emptyResult(mode: P1T14Mode | null): P1T14RunResult {
  return {
    result: 'BLOCKED',
    classification: null,
    errorCategory: null,
    mode,
    targetUrl: P1_T14_TARGET_URL,
    fixtureUploadedAt: null,
    eligibleAt: null,
    observedAt: null,
    ageMs: null,
    httpStatus: null,
    responseByteCount: null,
    sha256: null,
    exactMatch: null,
    absenceCategory: null,
    publicGetsThisRun: 0,
    totalPublicGetsObserved: 0,
    retries: 0,
    credentialsUsed: 0,
    providerMutations: 0,
    recommendation: null,
  };
}

function safeAge(nowMs: number, uploadedMs: number) {
  return Math.max(0, nowMs - uploadedMs);
}

function totalGets(rows: P1T14EvidenceRow[]) {
  return rows.filter((row) => row.stage === 'OBSERVATION_A_COMPLETED' || row.stage === 'OBSERVATION_B_COMPLETED').length;
}

function validateBPrerequisite(rows: P1T14EvidenceRow[]) {
  if (rows.some((row) => row.stage === 'RUN_FINALIZED')) return false;
  const a = rows.filter((row) => row.stage === 'OBSERVATION_A_COMPLETED');
  if (a.length !== 1) return false;
  return a[0]?.objectState === 'PRESENT_EXACT' && a[0]?.exactMatch === true;
}

async function fetchOnce(fetchImpl: FetchLike) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), P1_T14_TIMEOUT_MS);
  try {
    return await fetchImpl(P1_T14_TARGET_URL, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function runP1T14(options: P1T14RunOptions): Promise<P1T14RunResult> {
  const result = emptyResult(options.mode);
  if (!options.mode) {
    result.errorCategory = 'OBSERVATION_MODE_REQUIRED';
    return result;
  }

  const now = options.now ?? Date.now;
  const fetchImpl = options.fetchImpl ?? fetch;
  const journal = options.journal ?? new FixedP1T14Journal(now);
  let baselineText: string;
  try {
    baselineText = options.baselineText ?? (await readFile(P1_T14_BASELINE_PATH, 'utf8'));
  } catch {
    result.classification = 'RETENTION_BASELINE_EVIDENCE_UNAVAILABLE';
    result.errorCategory = 'RETENTION_BASELINE_EVIDENCE_UNAVAILABLE';
    return result;
  }
  const baseline = readAcceptedBaseline(baselineText);
  if (!baseline) {
    result.classification = 'RETENTION_BASELINE_EVIDENCE_UNAVAILABLE';
    result.errorCategory = 'RETENTION_BASELINE_EVIDENCE_UNAVAILABLE';
    return result;
  }

  result.fixtureUploadedAt = baseline.fixtureUploadedAt;
  const eligibleMs =
    baseline.fixtureUploadedAtMs +
    (options.mode === 'A' ? P1_T14_OBSERVATION_A_OFFSET_MS : P1_T14_OBSERVATION_B_OFFSET_MS);
  result.eligibleAt = new Date(eligibleMs).toISOString();
  const startedMs = now();
  result.ageMs = safeAge(startedMs, baseline.fixtureUploadedAtMs);
  if (startedMs < eligibleMs) {
    result.classification = 'MEDIA_RETENTION_SAFETY_FAILURE';
    result.result = 'FAIL';
    result.errorCategory = 'OBSERVATION_TOO_EARLY';
    return result;
  }

  let priorRows: P1T14EvidenceRow[] = [];
  try {
    if (options.mode === 'A') {
      await journal.initializeForA();
      await journal.append('RETENTION_BASELINE_LOADED', {
        fixtureUploadedAt: baseline.fixtureUploadedAt,
        expectedSize: P1_T12_EXPECTED_SIZE,
        expectedSha256: P1_T12_EXPECTED_SHA256,
        targetHost: 'media.zernio.com',
        targetPath: '/temp/1792767679997_dncsau4l_marketlyai-p1-t12-fixture.png',
      });
    } else {
      priorRows = await journal.readRows();
      if (!validateBPrerequisite(priorRows)) {
        result.classification = 'MEDIA_RETENTION_SAFETY_FAILURE';
        result.result = 'FAIL';
        result.errorCategory = 'OBSERVATION_B_PREREQUISITE_NOT_MET';
        return result;
      }
    }
  } catch {
    result.classification = 'MEDIA_RETENTION_SAFETY_FAILURE';
    result.result = 'FAIL';
    result.errorCategory = 'EVIDENCE_STATE_INVALID';
    return result;
  }

  const getCountBefore = totalGets(priorRows);
  if (getCountBefore >= P1_T14_TOTAL_GET_MAX) {
    result.classification = 'MEDIA_RETENTION_SAFETY_FAILURE';
    result.result = 'FAIL';
    result.errorCategory = 'PUBLIC_GET_CEILING_EXCEEDED';
    return result;
  }

  const startedStage = options.mode === 'A' ? 'OBSERVATION_A_STARTED' : 'OBSERVATION_B_STARTED';
  const completedStage = options.mode === 'A' ? 'OBSERVATION_A_COMPLETED' : 'OBSERVATION_B_COMPLETED';
  await journal.append(startedStage, {
    eligibleAt: result.eligibleAt,
    observationStartedAt: new Date(startedMs).toISOString(),
    ageMs: result.ageMs,
  });

  let response: Response;
  try {
    response = await fetchOnce(fetchImpl);
    result.publicGetsThisRun = 1;
    result.totalPublicGetsObserved = getCountBefore + 1;
  } catch (error) {
    result.classification = 'RETENTION_OBSERVATION_BLOCKED';
    result.result = 'BLOCKED';
    result.errorCategory = error instanceof Error && error.name === 'AbortError' ? 'NETWORK_TIMEOUT' : 'NETWORK_ERROR';
    result.observedAt = new Date(now()).toISOString();
    await journal.append(completedStage, {
      observationTimestamp: result.observedAt,
      ageMs: result.ageMs,
      httpStatus: null,
      absenceCategory: result.errorCategory,
    });
    await journal.append('RUN_FINALIZED', {
      classification: result.classification,
      publicGets: result.totalPublicGetsObserved,
      retries: 0,
      credentialsUsed: 0,
    });
    return result;
  }

  result.observedAt = new Date(now()).toISOString();
  result.httpStatus = response.status;

  if (response.status === 404 || response.status === 410) {
    result.classification = 'TEMPORARY_MEDIA_AUTO_DELETION_VERIFIED';
    result.result = 'PASS';
    result.absenceCategory = response.status === 404 ? 'HTTP_404_OBJECT_ABSENT' : 'HTTP_410_OBJECT_GONE';
    result.recommendation = 'Media Upload → SPIKE_PASS — AWAITING TEAM LEADER REVIEW';
    await journal.append(completedStage, {
      observationTimestamp: result.observedAt,
      ageMs: result.ageMs,
      httpStatus: response.status,
      objectState: 'ABSENT',
      absenceCategory: result.absenceCategory,
    });
    await journal.append('RUN_FINALIZED', {
      classification: result.classification,
      recommendation: result.recommendation,
      publicGets: result.totalPublicGetsObserved,
      retries: 0,
      credentialsUsed: 0,
    });
    return result;
  }

  if (response.status >= 200 && response.status < 300) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    result.responseByteCount = bytes.byteLength;
    result.sha256 = hash(bytes);
    result.exactMatch =
      result.responseByteCount === P1_T12_EXPECTED_SIZE && result.sha256 === P1_T12_EXPECTED_SHA256;
    if (!result.exactMatch) {
      result.classification = 'MEDIA_RETENTION_SAFETY_FAILURE';
      result.result = 'FAIL';
      result.errorCategory = 'PUBLIC_BINARY_MISMATCH';
      await journal.append(completedStage, {
        observationTimestamp: result.observedAt,
        ageMs: result.ageMs,
        httpStatus: response.status,
        responseByteCount: result.responseByteCount,
        sha256: result.sha256,
        exactMatch: false,
        objectState: 'BINARY_MISMATCH',
      });
      await journal.append('RUN_FINALIZED', {
        classification: result.classification,
        publicGets: result.totalPublicGetsObserved,
        retries: 0,
        credentialsUsed: 0,
      });
      return result;
    }
    await journal.append(completedStage, {
      observationTimestamp: result.observedAt,
      ageMs: result.ageMs,
      httpStatus: response.status,
      responseByteCount: result.responseByteCount,
      sha256: result.sha256,
      exactMatch: true,
      objectState: 'PRESENT_EXACT',
    });
    if (options.mode === 'A') {
      result.result = 'PENDING';
      result.errorCategory = null;
      result.recommendation = 'Observation B required at or after its eligibility timestamp; no request before then.';
      return result;
    }
    result.classification = 'TEMPORARY_MEDIA_STILL_PRESENT_AFTER_DOCUMENTED_RETENTION_WINDOW';
    result.result = 'PASS';
    result.recommendation = 'Media Upload remains PARTIALLY_VERIFIED — Provider/docs retention mismatch observed.';
    await journal.append('RUN_FINALIZED', {
      classification: result.classification,
      recommendation: result.recommendation,
      publicGets: result.totalPublicGetsObserved,
      retries: 0,
      credentialsUsed: 0,
    });
    return result;
  }

  result.classification = 'RETENTION_OBSERVATION_BLOCKED';
  result.result = 'BLOCKED';
  result.errorCategory =
    response.status === 403
      ? 'HTTP_403_AMBIGUOUS_DENIAL'
      : response.status >= 500
        ? 'HTTP_5XX_OR_CDN_FAILURE'
        : response.status >= 300 && response.status < 400
          ? 'UNEXPECTED_REDIRECT_BLOCKED'
          : 'AMBIGUOUS_HTTP_RESPONSE';
  result.absenceCategory = result.errorCategory;
  await journal.append(completedStage, {
    observationTimestamp: result.observedAt,
    ageMs: result.ageMs,
    httpStatus: response.status,
    absenceCategory: result.absenceCategory,
  });
  await journal.append('RUN_FINALIZED', {
    classification: result.classification,
    publicGets: result.totalPublicGetsObserved,
    retries: 0,
    credentialsUsed: 0,
  });
  return result;
}

async function main() {
  const parsed = parseP1T14Args(process.argv.slice(2));
  if (!parsed.ok) {
    console.error(JSON.stringify({ result: 'BLOCKED', errorCategory: 'INVALID_ARGUMENTS' }));
    process.exitCode = 2;
    return;
  }
  const result = await runP1T14({ mode: parsed.mode });
  console.log(JSON.stringify(result, null, 2));
  if (result.result === 'FAIL') process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}
