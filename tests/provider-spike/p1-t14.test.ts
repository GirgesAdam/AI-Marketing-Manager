import { describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import {
  P1_T14_BASELINE_PATH,
  P1_T14_EVIDENCE_PATH,
  P1_T14_OBSERVATION_A_OFFSET_MS,
  P1_T14_OBSERVATION_B_OFFSET_MS,
  P1_T14_TARGET_URL,
  P1T14EvidenceRow,
  P1T14Journal,
  P1T14Stage,
  parseP1T14Args,
  readAcceptedBaseline,
  runP1T14,
} from '../../src/provider-spike/p1-t14-runner.js';
import { P1_T12_EXPECTED_SHA256 } from '../../src/provider-spike/p1-t12-runner.js';

const UPLOADED_AT = '2026-10-23T15:01:20.743Z';
const UPLOADED_MS = Date.parse(UPLOADED_AT);
const A_ELIGIBLE = UPLOADED_MS + P1_T14_OBSERVATION_A_OFFSET_MS;
const B_ELIGIBLE = UPLOADED_MS + P1_T14_OBSERVATION_B_OFFSET_MS;
const exactBytes = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

function baselineText() {
  return [
    { sequence: 1, utcTimestamp: '2026-10-23T15:01:18.323Z', stage: 'RUN_STARTED' },
    { sequence: 2, utcTimestamp: '2026-10-23T15:01:19.573Z', stage: 'IDENTITY_VERIFIED' },
    { sequence: 3, utcTimestamp: '2026-10-23T15:01:20.025Z', stage: 'FRESH_PRESIGN_RECEIVED' },
    {
      sequence: 4,
      utcTimestamp: UPLOADED_AT,
      stage: 'REUPLOAD_COMPLETED',
      httpStatus: 200,
      sourceOriginalSize: 68,
      sourceOriginalSha256: P1_T12_EXPECTED_SHA256,
    },
    {
      sequence: 5,
      utcTimestamp: '2026-10-23T15:01:21.394Z',
      stage: 'PUBLIC_READ_VERIFIED',
      httpStatus: 200,
      downloadedByteCount: 68,
      sha256: P1_T12_EXPECTED_SHA256,
      exactMatch: true,
    },
    { sequence: 6, utcTimestamp: '2026-10-23T15:01:21.398Z', stage: 'RUN_FINALIZED' },
  ]
    .map((row) => JSON.stringify(row))
    .join('\n');
}

class MemoryJournal implements P1T14Journal {
  rows: P1T14EvidenceRow[];
  initialized = false;
  constructor(rows: P1T14EvidenceRow[] = []) {
    this.rows = rows;
  }
  async initializeForA() {
    if (this.initialized || this.rows.length) throw new Error('already initialized');
    this.initialized = true;
  }
  async readRows() {
    return this.rows.map((row) => ({ ...row }));
  }
  async append(stage: P1T14Stage, fields: Record<string, unknown>) {
    this.rows.push({ stage, ...fields });
  }
}

type Call = { url: string; init: RequestInit | undefined };
function makeFetch(response: Response | Error) {
  const calls: Call[] = [];
  const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    if (response instanceof Error) throw response;
    return response;
  });
  return { calls, fetchImpl };
}

const exactResponse = () => new Response(exactBytes, { status: 200 });
const priorAExact = (): P1T14EvidenceRow[] => [
  {
    stage: 'RETENTION_BASELINE_LOADED',
    fixtureUploadedAt: UPLOADED_AT,
    expectedSize: 68,
    expectedSha256: P1_T12_EXPECTED_SHA256,
  },
  { stage: 'OBSERVATION_A_STARTED', eligibleAt: new Date(A_ELIGIBLE).toISOString() },
  {
    stage: 'OBSERVATION_A_COMPLETED',
    httpStatus: 200,
    responseByteCount: 68,
    sha256: P1_T12_EXPECTED_SHA256,
    exactMatch: true,
    objectState: 'PRESENT_EXACT',
  },
];

function runA(response: Response | Error, now = A_ELIGIBLE + 1000) {
  const journal = new MemoryJournal();
  const network = makeFetch(response);
  return {
    journal,
    network,
    result: runP1T14({
      mode: 'A',
      now: () => now,
      fetchImpl: network.fetchImpl,
      journal,
      baselineText: baselineText(),
    }),
  };
}

function runB(response: Response | Error, rows = priorAExact(), now = B_ELIGIBLE + 1000) {
  const journal = new MemoryJournal(rows);
  const network = makeFetch(response);
  return {
    journal,
    network,
    result: runP1T14({
      mode: 'B',
      now: () => now,
      fetchImpl: network.fetchImpl,
      journal,
      baselineText: baselineText(),
    }),
  };
}

describe('P1-T14 bounded temporary-media retention observation', () => {
  it('T14-01 requires explicit observation mode and performs zero network by default', async () => {
    const network = makeFetch(new Error('must not run'));
    const result = await runP1T14({ mode: null, fetchImpl: network.fetchImpl, baselineText: baselineText() });
    expect(result.errorCategory).toBe('OBSERVATION_MODE_REQUIRED');
    expect(result.classification).toBeNull();
    expect(network.calls).toHaveLength(0);
  });

  it('T14-02 CLI accepts only observe-a or observe-b and exposes no arbitrary URL/file input', () => {
    expect(parseP1T14Args([])).toEqual({ ok: true, mode: null });
    expect(parseP1T14Args(['--observe-a'])).toEqual({ ok: true, mode: 'A' });
    expect(parseP1T14Args(['--observe-b'])).toEqual({ ok: true, mode: 'B' });
    for (const args of [['--url=x'], ['--file=x'], ['--live'], ['--observe-a', '--url=x'], ['--presign']]) {
      expect(parseP1T14Args(args)).toEqual({ ok: false, mode: null });
    }
  });

  it('T14-03 frozen target and baseline path are exact', () => {
    expect(P1_T14_TARGET_URL).toBe(
      'https://media.zernio.com/temp/1792767679997_dncsau4l_marketlyai-p1-t12-fixture.png',
    );
    expect(P1_T14_BASELINE_PATH).toBe('artifacts/provider-spike/p1-t13-evidence.jsonl');
  });

  it('T14-04 accepted baseline requires the exact six checkpoints and public binary proof', () => {
    expect(readAcceptedBaseline(baselineText())).toEqual({
      fixtureUploadedAt: UPLOADED_AT,
      fixtureUploadedAtMs: UPLOADED_MS,
    });
    expect(readAcceptedBaseline('{}')).toBeNull();
  });

  it('T14-05 malformed baseline blocks before network', async () => {
    const network = makeFetch(exactResponse());
    const result = await runP1T14({
      mode: 'A',
      now: () => A_ELIGIBLE + 1,
      fetchImpl: network.fetchImpl,
      journal: new MemoryJournal(),
      baselineText: '{bad-json',
    });
    expect(result.classification).toBe('RETENTION_BASELINE_EVIDENCE_UNAVAILABLE');
    expect(network.calls).toHaveLength(0);
  });

  it('T14-06 Observation A fails closed before its exact eligibility timestamp', async () => {
    const scenario = runA(exactResponse(), A_ELIGIBLE - 1);
    const result = await scenario.result;
    expect(result.classification).toBe('MEDIA_RETENTION_SAFETY_FAILURE');
    expect(result.errorCategory).toBe('OBSERVATION_TOO_EARLY');
    expect(scenario.network.calls).toHaveLength(0);
    expect(scenario.journal.rows).toHaveLength(0);
  });

  it('T14-07 Observation B fails closed before its exact eligibility timestamp', async () => {
    const scenario = runB(exactResponse(), priorAExact(), B_ELIGIBLE - 1);
    const result = await scenario.result;
    expect(result.classification).toBe('MEDIA_RETENTION_SAFETY_FAILURE');
    expect(result.errorCategory).toBe('OBSERVATION_TOO_EARLY');
    expect(scenario.network.calls).toHaveLength(0);
  });

  it('T14-08 Observation A performs exactly one frozen unauthenticated GET', async () => {
    const scenario = runA(exactResponse());
    await scenario.result;
    expect(scenario.network.calls).toHaveLength(1);
    expect(scenario.network.calls[0]!.url).toBe(P1_T14_TARGET_URL);
    expect(scenario.network.calls[0]!.init?.method).toBe('GET');
    expect(scenario.network.calls[0]!.init?.redirect).toBe('manual');
    expect(scenario.network.calls[0]!.init?.headers).toBeUndefined();
  });

  it('T14-09 HTTP 404 at A is definitive deletion evidence and finalizes', async () => {
    const scenario = runA(new Response('', { status: 404 }));
    const result = await scenario.result;
    expect(result.classification).toBe('TEMPORARY_MEDIA_AUTO_DELETION_VERIFIED');
    expect(result.recommendation).toContain('SPIKE_PASS');
    expect(result.publicGetsThisRun).toBe(1);
    expect(scenario.journal.rows.map((row) => row.stage)).toEqual([
      'RETENTION_BASELINE_LOADED',
      'OBSERVATION_A_STARTED',
      'OBSERVATION_A_COMPLETED',
      'RUN_FINALIZED',
    ]);
  });

  it('T14-10 HTTP 410 at A is definitive deletion evidence', async () => {
    const result = await runA(new Response('', { status: 410 })).result;
    expect(result.classification).toBe('TEMPORARY_MEDIA_AUTO_DELETION_VERIFIED');
    expect(result.absenceCategory).toBe('HTTP_410_OBJECT_GONE');
  });

  it('T14-11 exact HTTP 200 at A schedules B only and does not finalize', async () => {
    const scenario = runA(exactResponse());
    const result = await scenario.result;
    expect(result.result).toBe('PENDING');
    expect(result.classification).toBeNull();
    expect(result.responseByteCount).toBe(68);
    expect(result.sha256).toBe(P1_T12_EXPECTED_SHA256);
    expect(result.exactMatch).toBe(true);
    expect(scenario.journal.rows.map((row) => row.stage)).toEqual([
      'RETENTION_BASELINE_LOADED',
      'OBSERVATION_A_STARTED',
      'OBSERVATION_A_COMPLETED',
    ]);
  });

  it('T14-12 2xx binary mismatch is a safety failure, not successful retention', async () => {
    const result = await runA(new Response(Buffer.from('different'), { status: 200 })).result;
    expect(result.classification).toBe('MEDIA_RETENTION_SAFETY_FAILURE');
    expect(result.errorCategory).toBe('PUBLIC_BINARY_MISMATCH');
  });

  it('T14-13 HTTP 403 remains blocked and is not deletion evidence', async () => {
    const result = await runA(new Response('', { status: 403 })).result;
    expect(result.classification).toBe('RETENTION_OBSERVATION_BLOCKED');
    expect(result.errorCategory).toBe('HTTP_403_AMBIGUOUS_DENIAL');
  });

  it('T14-14 CDN 5xx remains blocked', async () => {
    const result = await runA(new Response('', { status: 503 })).result;
    expect(result.classification).toBe('RETENTION_OBSERVATION_BLOCKED');
    expect(result.errorCategory).toBe('HTTP_5XX_OR_CDN_FAILURE');
  });

  it('T14-15 redirect is not followed and remains blocked', async () => {
    const result = await runA(new Response('', { status: 302, headers: { location: 'https://example.com/x' } })).result;
    expect(result.classification).toBe('RETENTION_OBSERVATION_BLOCKED');
    expect(result.errorCategory).toBe('UNEXPECTED_REDIRECT_BLOCKED');
  });

  it('T14-16 network failure is blocked with no automatic retry', async () => {
    const scenario = runA(new Error('dns failure'));
    const result = await scenario.result;
    expect(result.classification).toBe('RETENTION_OBSERVATION_BLOCKED');
    expect(result.errorCategory).toBe('NETWORK_ERROR');
    expect(scenario.network.calls).toHaveLength(1);
    expect(result.retries).toBe(0);
  });

  it('T14-17 B cannot execute without exact-present A evidence', async () => {
    const scenario = runB(exactResponse(), []);
    const result = await scenario.result;
    expect(result.classification).toBe('MEDIA_RETENTION_SAFETY_FAILURE');
    expect(result.errorCategory).toBe('OBSERVATION_B_PREREQUISITE_NOT_MET');
    expect(scenario.network.calls).toHaveLength(0);
  });

  it('T14-18 B exact HTTP 200 produces documented-retention mismatch classification', async () => {
    const scenario = runB(exactResponse());
    const result = await scenario.result;
    expect(result.classification).toBe('TEMPORARY_MEDIA_STILL_PRESENT_AFTER_DOCUMENTED_RETENTION_WINDOW');
    expect(result.exactMatch).toBe(true);
    expect(result.totalPublicGetsObserved).toBe(2);
    expect(scenario.network.calls).toHaveLength(1);
  });

  it('T14-19 B HTTP 404 can verify deletion after exact-present A', async () => {
    const result = await runB(new Response('', { status: 404 })).result;
    expect(result.classification).toBe('TEMPORARY_MEDIA_AUTO_DELETION_VERIFIED');
    expect(result.totalPublicGetsObserved).toBe(2);
  });

  it('T14-20 aggregate GET ceiling fails closed before a third request', async () => {
    const rows = [
      ...priorAExact(),
      {
        stage: 'OBSERVATION_B_COMPLETED' as const,
        httpStatus: 200,
        exactMatch: true,
        objectState: 'PRESENT_EXACT',
      },
    ];
    const scenario = runB(exactResponse(), rows);
    const result = await scenario.result;
    expect(result.classification).toBe('MEDIA_RETENTION_SAFETY_FAILURE');
    expect(result.errorCategory).toBe('PUBLIC_GET_CEILING_EXCEEDED');
    expect(scenario.network.calls).toHaveLength(0);
  });

  it('T14-21 B appends only its actually reached stages after A evidence', async () => {
    const scenario = runB(exactResponse());
    await scenario.result;
    expect(scenario.journal.rows.map((row) => row.stage)).toEqual([
      'RETENTION_BASELINE_LOADED',
      'OBSERVATION_A_STARTED',
      'OBSERVATION_A_COMPLETED',
      'OBSERVATION_B_STARTED',
      'OBSERVATION_B_COMPLETED',
      'RUN_FINALIZED',
    ]);
  });

  it('T14-22 runner source exposes no credential, presign, PUT, publish, DM, comment, Ads or webhook surface', async () => {
    const source = await readFile('src/provider-spike/p1-t14-runner.ts', 'utf8');
    expect(source).not.toContain('ZERNIO_API_KEY');
    expect(source).not.toContain('Authorization');
    expect(source).not.toContain('/media/presign');
    expect(source).not.toMatch(/method:\s*['"]PUT['"]/);
    expect(source).not.toContain('/posts');
    expect(source).not.toContain('/inbox');
    expect(source).not.toContain('/ads');
    expect(source).not.toContain('/webhooks');
  });

  it('T14-23 evidence path is fixed and gitignored', async () => {
    expect(P1_T14_EVIDENCE_PATH).toBe('artifacts/provider-spike/p1-t14-evidence.jsonl');
    const ignore = await readFile('.gitignore', 'utf8');
    expect(ignore).toContain('artifacts/provider-spike/');
  });

  it('T14-24 eligibility ages are derived from REUPLOAD_COMPLETED baseline exactly', async () => {
    const a = await runA(exactResponse(), A_ELIGIBLE + 1234).result;
    const b = await runB(exactResponse(), priorAExact(), B_ELIGIBLE + 2345).result;
    expect(a.eligibleAt).toBe(new Date(A_ELIGIBLE).toISOString());
    expect(a.ageMs).toBe(P1_T14_OBSERVATION_A_OFFSET_MS + 1234);
    expect(b.eligibleAt).toBe(new Date(B_ELIGIBLE).toISOString());
    expect(b.ageMs).toBe(P1_T14_OBSERVATION_B_OFFSET_MS + 2345);
  });
});
