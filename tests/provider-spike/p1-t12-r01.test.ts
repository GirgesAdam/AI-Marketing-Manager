import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFile, rm } from 'node:fs/promises';
import {
  FixedEvidenceJournal,
  P1_T12_R01_EVIDENCE_PATH,
  P1_T12_R01_PID_PATH,
  P1T12R01Stage,
  SafeCounters,
  parseP1T12R01Args,
  runP1T12R01,
} from '../../src/provider-spike/p1-t12-r01-runner.js';
import {
  P1_T12_BASE64,
  P1_T12_EXPECTED_SHA256,
  P1_T12_FILENAME,
} from '../../src/provider-spike/p1-t12-runner.js';

const API_KEY = 'P1T12_R01_API_SECRET_SENTINEL';
const EMAIL = 'expected-r01@example.invalid';
const SIGNATURE = 'P1T12_R01_SIGNED_QUERY_SECRET_SENTINEL';
const RAW_CLOUD = 'RAW_CLOUD_BODY_SIGNED_SECRET_SENTINEL';
const KEY = `temp/1700000000_r01_${P1_T12_FILENAME}`;
const UPLOAD = `https://bucket.r2.cloudflarestorage.com/${KEY}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=${SIGNATURE}`;
const PUBLIC = `https://media.zernio.com/${KEY}`;
const fixture = Buffer.from(P1_T12_BASE64, 'base64');

type Call = { url: string; init: RequestInit | undefined };
type Row = { stage: P1T12R01Stage; [key: string]: unknown };

class MemoryJournal {
  rows: Row[] = [];
  failStage: P1T12R01Stage | null = null;
  initialized = false;

  async initialize() {
    this.initialized = true;
  }

  async append(
    stage: P1T12R01Stage,
    counters: SafeCounters,
    fields: Record<string, unknown>,
    _forbidden: string[],
  ) {
    if (this.failStage === stage) throw new Error('disk raw secret');
    this.rows.push({ stage, counters: { ...counters }, ...fields });
  }
}

class Guard {
  constructor(private readonly ok = true) {}
  async acquire() {
    return this.ok;
  }
}

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });

function makeFetch(responses: Response[]) {
  const calls: Call[] = [];
  let index = 0;
  const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    const response = responses[index++];
    if (!response) throw new Error('NETWORK_RAW_SECRET_SENTINEL');
    return response;
  });
  return { fetchImpl, calls };
}

const env = (): NodeJS.ProcessEnv => ({
  ZERNIO_API_KEY: API_KEY,
  ZERNIO_EXPECTED_USER_EMAIL: EMAIL,
});

const presign = (overrides: Record<string, unknown> = {}) => ({
  uploadUrl: UPLOAD,
  publicUrl: PUBLIC,
  key: KEY,
  expiresIn: 1,
  ...overrides,
});

const expired = () =>
  new Response(`<Error><Message>Request has expired ${RAW_CLOUD}</Message></Error>`, {
    status: 403,
  });

const happyResponses = () => [
  json({ valid: true, email: EMAIL }, 200, { 'x-request-id': 'auth-r01' }),
  json(presign(), 200, { 'x-request-id': 'presign-r01' }),
  new Response('', { status: 200 }),
  new Response(fixture, { status: 200 }),
  expired(),
];

function clock() {
  let value = 1_700_000_000_000;
  return {
    now: () => value,
    advance: (ms: number) => {
      value += ms;
    },
    sleep: vi.fn(async (ms: number) => {
      value += ms;
    }),
  };
}

function setup(responses = happyResponses()) {
  const journal = new MemoryJournal();
  const guard = new Guard();
  const network = makeFetch(responses);
  const time = clock();
  return {
    journal,
    guard,
    network,
    time,
    run: () =>
      runP1T12R01({
        live: true,
        env: env(),
        fetchImpl: network.fetchImpl,
        now: time.now,
        sleep: time.sleep,
        journal,
        pidGuard: guard,
      }),
  };
}

afterEach(async () => {
  await rm(P1_T12_R01_EVIDENCE_PATH, { force: true });
  await rm(P1_T12_R01_PID_PATH, { force: true });
});

describe('P1-T12-R01 durable safe evidence', () => {
  it('R01-01 defaults live OFF with zero network', async () => {
    const network = makeFetch([]);
    const result = await runP1T12R01({ env: {}, fetchImpl: network.fetchImpl });
    expect(result.errorCategory).toBe('LIVE_OPT_IN_REQUIRED');
    expect(network.calls).toHaveLength(0);
  });

  it('R01-02 only --live is accepted; no caller-selected evidence/file/url path', () => {
    expect(parseP1T12R01Args([])).toEqual({ ok: true, live: false });
    expect(parseP1T12R01Args(['--live'])).toEqual({ ok: true, live: true });
    for (const args of [['--evidence=x'], ['--file=x'], ['--url=x'], ['--live', '--evidence=x']]) {
      expect(parseP1T12R01Args(args)).toEqual({ ok: false, live: false });
    }
  });

  it('R01-03 frozen asset remains exact', async () => {
    const scenario = setup();
    const result = await scenario.run();
    expect(result.asset).toEqual({
      filename: 'marketlyai-p1-t12-fixture.png',
      contentType: 'image/png',
      size: 68,
      sha256: P1_T12_EXPECTED_SHA256,
      valid: true,
    });
  });

  it('R01-04 success preserves exact checkpoint order', async () => {
    const scenario = setup();
    const result = await scenario.run();
    expect(result.classification).toBe(
      'TEMP_MEDIA_PRESIGN_UPLOAD_PUBLIC_READ_AND_UPLOAD_URL_EXPIRY_VERIFIED',
    );
    expect(scenario.journal.rows.map((row) => row.stage)).toEqual([
      'RUN_STARTED',
      'IDENTITY_VERIFIED',
      'PRESIGN_RECEIVED',
      'INITIAL_UPLOAD_COMPLETED',
      'PUBLIC_READ_VERIFIED',
      'EXPIRY_WAIT_STARTED',
      'EXPIRY_DEADLINE_REACHED',
      'EXPIRED_PUT_COMPLETED',
      'RUN_FINALIZED',
    ]);
  });

  it('R01-05 EXPIRY_WAIT_STARTED is persisted before sleeping', async () => {
    const scenario = setup();
    const sleep = vi.fn(async (ms: number) => {
      expect(scenario.journal.rows.at(-1)?.stage).toBe('EXPIRY_WAIT_STARTED');
      scenario.time.advance(ms);
    });
    const result = await runP1T12R01({
      live: true,
      env: env(),
      fetchImpl: scenario.network.fetchImpl,
      now: scenario.time.now,
      sleep,
      journal: scenario.journal,
      pidGuard: scenario.guard,
    });
    expect(result.classification).toBe(
      'TEMP_MEDIA_PRESIGN_UPLOAD_PUBLIC_READ_AND_UPLOAD_URL_EXPIRY_VERIFIED',
    );
    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it('R01-06 EXPIRED_PUT_COMPLETED precedes RUN_FINALIZED', async () => {
    const scenario = setup();
    await scenario.run();
    const stages = scenario.journal.rows.map((row) => row.stage);
    expect(stages.indexOf('EXPIRED_PUT_COMPLETED')).toBeGreaterThan(
      stages.indexOf('EXPIRY_DEADLINE_REACHED'),
    );
    expect(stages.indexOf('RUN_FINALIZED')).toBeGreaterThan(
      stages.indexOf('EXPIRED_PUT_COMPLETED'),
    );
  });

  it('R01-07 fixed journal writes sequential JSONL and excludes secrets/signed URL/raw cloud body', async () => {
    const scenario = setup();
    const journal = new FixedEvidenceJournal(scenario.time.now);
    const result = await runP1T12R01({
      live: true,
      env: env(),
      fetchImpl: scenario.network.fetchImpl,
      now: scenario.time.now,
      sleep: scenario.time.sleep,
      journal,
      pidGuard: scenario.guard,
    });
    expect(result.result).toBe('PASS');
    const persisted = await readFile(P1_T12_R01_EVIDENCE_PATH, 'utf8');
    const lines = persisted
      .trim()
      .split(/\r?\n/)
      .map((line) => JSON.parse(line));
    expect(lines).toHaveLength(9);
    expect(lines.map((line) => line.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(lines[5].stage).toBe('EXPIRY_WAIT_STARTED');
    expect(lines[7].stage).toBe('EXPIRED_PUT_COMPLETED');
    for (const secret of [UPLOAD, SIGNATURE, API_KEY, EMAIL, RAW_CLOUD, 'X-Amz-Signature=']) {
      expect(persisted).not.toContain(secret);
    }
  });

  it('R01-08 duplicate live launch fails closed before evidence/network', async () => {
    const journal = new MemoryJournal();
    const network = makeFetch([]);
    const result = await runP1T12R01({
      live: true,
      env: env(),
      fetchImpl: network.fetchImpl,
      journal,
      pidGuard: new Guard(false),
    });
    expect(result.classification).toBe('MEDIA_SAFETY_FAILURE');
    expect(result.errorCategory).toBe('SAFETY_DUPLICATE_LIVE_LAUNCH_OR_STALE_PID');
    expect(journal.initialized).toBe(false);
    expect(network.calls).toHaveLength(0);
  });

  it('R01-09 one presign, at most two PUTs, one public GET on verified path', async () => {
    const scenario = setup();
    const result = await scenario.run();
    expect(result.counters).toMatchObject({
      zernioApiCalls: 2,
      presigns: 1,
      initialPuts: 1,
      expiredPuts: 1,
      publicGets: 1,
      networkCalls: 5,
      retries: 0,
    });
    expect(scenario.network.calls.filter((call) => call.url.includes('/v1/media/presign'))).toHaveLength(1);
    expect(scenario.network.calls.filter((call) => call.init?.method === 'PUT')).toHaveLength(2);
  });

  it('R01-10 recognized expiry rejection produces verified classification', async () => {
    const scenario = setup();
    const result = await scenario.run();
    expect(result.result).toBe('PASS');
    expect(result.classification).toBe(
      'TEMP_MEDIA_PRESIGN_UPLOAD_PUBLIC_READ_AND_UPLOAD_URL_EXPIRY_VERIFIED',
    );
    expect(result.recommendation).toBe(
      'Media Upload → PARTIALLY_VERIFIED — AWAITING TEAM LEADER REVIEW',
    );
    expect(result.expiry).toMatchObject({
      status: 403,
      safeErrorCategory: 'SIGNED_REQUEST_EXPIRED',
      rejected: true,
      deadlineReached: true,
    });
  });

  it('R01-11 signature-invalid rejection is also a definitive signed-request rejection', async () => {
    const responses = happyResponses();
    responses[4] = new Response('<Error><Code>SignatureDoesNotMatch</Code></Error>', { status: 403 });
    const scenario = setup(responses);
    const result = await scenario.run();
    expect(result.classification).toBe(
      'TEMP_MEDIA_PRESIGN_UPLOAD_PUBLIC_READ_AND_UPLOAD_URL_EXPIRY_VERIFIED',
    );
    expect(result.expiry.safeErrorCategory).toBe('SIGNED_REQUEST_INVALID');
  });

  it('R01-12 post-expiry PUT success is never accepted', async () => {
    const responses = happyResponses();
    responses[4] = new Response('', { status: 200 });
    const scenario = setup(responses);
    const result = await scenario.run();
    expect(result.classification).toBe('PRESIGNED_UPLOAD_EXPIRY_NOT_ENFORCED_AS_EXPECTED');
    expect(result.result).toBe('FAIL');
  });

  it('R01-13 initial upload failure blocks without retry/public read/expired PUT', async () => {
    const scenario = setup([
      json({ valid: true, email: EMAIL }),
      json(presign()),
      new Response('denied', { status: 403 }),
    ]);
    const result = await scenario.run();
    expect(result.classification).toBe('TEMP_MEDIA_UPLOAD_BLOCKED');
    expect(result.counters).toMatchObject({
      presigns: 1,
      initialPuts: 1,
      expiredPuts: 0,
      publicGets: 0,
      retries: 0,
    });
    expect(scenario.network.calls).toHaveLength(3);
  });

  it('R01-14 public binary mismatch blocks before expiry wait', async () => {
    const scenario = setup([
      json({ valid: true, email: EMAIL }),
      json(presign()),
      new Response('', { status: 200 }),
      new Response('wrong', { status: 200 }),
    ]);
    const result = await scenario.run();
    expect(result.classification).toBe('TEMP_MEDIA_UPLOAD_BLOCKED');
    expect(result.errorCategory).toBe('PUBLIC_BINARY_MISMATCH');
    expect(result.counters.expiredPuts).toBe(0);
    expect(scenario.time.sleep).not.toHaveBeenCalled();
  });

  it('R01-15 generic post-expiry non-2xx remains provider-blocked', async () => {
    const responses = happyResponses();
    responses[4] = new Response('forbidden', { status: 403 });
    const scenario = setup(responses);
    const result = await scenario.run();
    expect(result.classification).toBe('MEDIA_PROVIDER_BEHAVIOR_BLOCKED');
    expect(result.errorCategory).toBe('NON_2XX_UNCLASSIFIED');
  });

  it('R01-16 evidence write failure becomes MEDIA_EVIDENCE_CAPTURE_FAILURE and stops next network step', async () => {
    const scenario = setup();
    scenario.journal.failStage = 'PRESIGN_RECEIVED';
    const result = await scenario.run();
    expect(result.classification).toBe('MEDIA_EVIDENCE_CAPTURE_FAILURE');
    expect(scenario.network.calls).toHaveLength(2);
    expect(result.counters.initialPuts).toBe(0);
  });

  it('R01-17 wrong presign target is safety failure before upload', async () => {
    const scenario = setup([
      json({ valid: true, email: EMAIL }),
      json(presign({ uploadUrl: `https://evil.invalid/${KEY}?sig=${SIGNATURE}` })),
    ]);
    const result = await scenario.run();
    expect(result.classification).toBe('MEDIA_SAFETY_FAILURE');
    expect(result.errorCategory).toBe('SAFETY_UNEXPECTED_PRESIGN_TARGET');
    expect(result.counters.initialPuts).toBe(0);
  });

  it('R01-18 deadline false is safety failure and second PUT is not attempted', async () => {
    const scenario = setup();
    const badSleep = vi.fn(async (_ms: number) => {
      scenario.time.advance(1);
    });
    const result = await runP1T12R01({
      live: true,
      env: env(),
      fetchImpl: scenario.network.fetchImpl,
      now: scenario.time.now,
      sleep: badSleep,
      journal: scenario.journal,
      pidGuard: scenario.guard,
    });
    expect(result.classification).toBe('MEDIA_SAFETY_FAILURE');
    expect(result.errorCategory).toBe('SAFETY_EXPIRY_DEADLINE_NOT_REACHED');
    expect(result.counters.expiredPuts).toBe(0);
    expect(scenario.network.calls).toHaveLength(4);
  });

  it('R01-19 network exceptions are sanitized and raw error details are not journaled', async () => {
    const journal = new MemoryJournal();
    const time = clock();
    const fetchImpl = vi.fn(async () => {
      throw new Error('NETWORK_RAW_SECRET_SENTINEL?X-Amz-Signature=bad');
    });
    const result = await runP1T12R01({
      live: true,
      env: env(),
      fetchImpl,
      now: time.now,
      sleep: time.sleep,
      journal,
      pidGuard: new Guard(),
    });
    expect(result.classification).toBe('MEDIA_PROVIDER_BEHAVIOR_BLOCKED');
    expect(result.errorCategory).toBe('NETWORK_ERROR');
    expect(JSON.stringify(journal.rows)).not.toContain('NETWORK_RAW_SECRET_SENTINEL');
    expect(JSON.stringify(journal.rows)).not.toContain('X-Amz-Signature=bad');
  });

  it('R01-20 presign request is fixed and has no permanent/lifetime override', async () => {
    const scenario = setup();
    await scenario.run();
    const body = JSON.parse(String(scenario.network.calls[1]?.init?.body));
    expect(body).toEqual({
      filename: 'marketlyai-p1-t12-fixture.png',
      contentType: 'image/png',
      size: 68,
    });
    expect(body).not.toHaveProperty('permanent');
  });

  it('R01-21 no social/publish/DM/comment/Ads/webhook/permanent surface exists', async () => {
    const scenario = setup();
    const result = await scenario.run();
    expect(result.counters.postsSocialMutations).toBe(0);
    expect(result.permanentUploads).toBe(0);
    expect(
      scenario.network.calls.some((call) => /\/v1\/(posts|inbox|ads|webhooks|comments)/.test(call.url)),
    ).toBe(false);
  });

  it('R01-22 public read records exact binary metadata without persisting bytes', async () => {
    const scenario = setup();
    const result = await scenario.run();
    expect(result.publicRead).toEqual({
      status: 200,
      size: 68,
      sha256: P1_T12_EXPECTED_SHA256,
      exactMatch: true,
    });
    expect(JSON.stringify(scenario.journal.rows)).not.toContain(P1_T12_BASE64);
  });
});
