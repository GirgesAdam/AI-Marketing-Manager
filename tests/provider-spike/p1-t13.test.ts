import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFile, rm } from 'node:fs/promises';
import {
  FixedEvidenceJournal,
  P1_T13_EVIDENCE_PATH,
  P1_T13_PID_PATH,
  P1T13Counters,
  P1T13Stage,
  parseP1T13Args,
  runP1T13,
} from '../../src/provider-spike/p1-t13-runner.js';
import {
  P1_T12_BASE64,
  P1_T12_EXPECTED_SHA256,
  P1_T12_FILENAME,
} from '../../src/provider-spike/p1-t12-runner.js';

const API_KEY = 'P1T13_API_SECRET_SENTINEL';
const EMAIL = 'expected-p1-t13@example.invalid';
const SIGNATURE = 'P1T13_SIGNED_QUERY_SECRET_SENTINEL';
const KEY = `temp/1800000000_p1t13_${P1_T12_FILENAME}`;
const UPLOAD = `https://bucket.r2.cloudflarestorage.com/${KEY}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=${SIGNATURE}`;
const PUBLIC = `https://media.zernio.com/${KEY}`;
const OLD_EXPIRED_UPLOAD = `https://old.r2.cloudflarestorage.com/temp/old_${P1_T12_FILENAME}?X-Amz-Signature=OLD_EXPIRED`;
const fixture = Buffer.from(P1_T12_BASE64, 'base64');

type Call = { url: string; init: RequestInit | undefined };
type Row = { stage: P1T13Stage; [key: string]: unknown };

class MemoryJournal {
  rows: Row[] = [];
  failStage: P1T13Stage | null = null;
  initialized = false;

  async initialize() {
    this.initialized = true;
  }

  async append(
    stage: P1T13Stage,
    counters: P1T13Counters,
    fields: Record<string, unknown>,
    _forbidden: string[],
  ) {
    if (this.failStage === stage) throw new Error('disk failure with secret sentinel');
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
    if (!response) throw new Error('UNEXPECTED_EXTRA_NETWORK_CALL');
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
  expiresIn: 3600,
  ...overrides,
});

const happyResponses = () => [
  json({ valid: true, email: EMAIL }, 200, { 'x-request-id': 'auth-p1t13' }),
  json(presign(), 200, { 'x-request-id': 'presign-p1t13' }),
  new Response('', { status: 200 }),
  new Response(fixture, { status: 200 }),
];

function setup(responses = happyResponses()) {
  const journal = new MemoryJournal();
  const guard = new Guard();
  const network = makeFetch(responses);
  return {
    journal,
    guard,
    network,
    run: () =>
      runP1T13({
        live: true,
        env: env(),
        fetchImpl: network.fetchImpl,
        now: () => 1_800_000_000_000,
        journal,
        pidGuard: guard,
      }),
  };
}

afterEach(async () => {
  await rm(P1_T13_EVIDENCE_PATH, { force: true });
  await rm(P1_T13_PID_PATH, { force: true });
});

describe('P1-T13 approved-original fresh-presign re-upload', () => {
  it('T13-01 defaults live OFF with zero network', async () => {
    const network = makeFetch([]);
    const result = await runP1T13({ env: {}, fetchImpl: network.fetchImpl });
    expect(result.liveEnabled).toBe(false);
    expect(result.errorCategory).toBe('LIVE_OPT_IN_REQUIRED');
    expect(network.calls).toHaveLength(0);
  });

  it('T13-02 accepts only --live and exposes no file/url/permanent/publish argument surface', () => {
    expect(parseP1T13Args([])).toEqual({ ok: true, live: false });
    expect(parseP1T13Args(['--live'])).toEqual({ ok: true, live: true });
    for (const args of [
      ['--file=x'],
      ['--url=x'],
      ['--old-upload-url=x'],
      ['--evidence=x'],
      ['--permanent'],
      ['--publish'],
      ['--live', '--url=x'],
    ]) {
      expect(parseP1T13Args(args)).toEqual({ ok: false, live: false });
    }
  });

  it('T13-03 reconstructs the exact retained approved original', async () => {
    const scenario = setup();
    const result = await scenario.run();
    expect(result.asset).toEqual({
      filename: 'marketlyai-p1-t12-fixture.png',
      contentType: 'image/png',
      size: 68,
      sha256: P1_T12_EXPECTED_SHA256,
      valid: true,
      source: 'RETAINED_FROZEN_ORIGINAL',
    });
  });

  it('T13-04 success records exactly six durable checkpoints in order', async () => {
    const scenario = setup();
    const result = await scenario.run();
    expect(result.classification).toBe('APPROVED_ORIGINAL_FRESH_PRESIGN_REUPLOAD_VERIFIED');
    expect(scenario.journal.rows.map((row) => row.stage)).toEqual([
      'RUN_STARTED',
      'IDENTITY_VERIFIED',
      'FRESH_PRESIGN_RECEIVED',
      'REUPLOAD_COMPLETED',
      'PUBLIC_READ_VERIFIED',
      'RUN_FINALIZED',
    ]);
  });

  it('T13-05 happy path uses exactly identity + fresh presign + one PUT + one public GET', async () => {
    const scenario = setup();
    const result = await scenario.run();
    expect(result.result).toBe('PASS');
    expect(scenario.network.calls).toHaveLength(4);
    expect(scenario.network.calls.map((call) => call.url)).toEqual([
      'https://zernio.com/api/v1/auth/verify',
      'https://zernio.com/api/v1/media/presign',
      UPLOAD,
      PUBLIC,
    ]);
    expect(result.counters).toEqual({
      zernioApiCalls: 2,
      freshPresigns: 1,
      cloudPuts: 1,
      publicGets: 1,
      networkCalls: 4,
      secondPresign: 0,
      retries: 0,
      socialMutations: 0,
    });
  });

  it('T13-06 fresh presign request and PUT use the exact frozen contract and bytes', async () => {
    const scenario = setup();
    await scenario.run();
    const presignCall = scenario.network.calls[1]!;
    expect(presignCall.init?.method).toBe('POST');
    expect(JSON.parse(String(presignCall.init?.body))).toEqual({
      filename: P1_T12_FILENAME,
      contentType: 'image/png',
      size: 68,
    });
    const putCall = scenario.network.calls[2]!;
    expect(putCall.init?.method).toBe('PUT');
    expect(new Headers(putCall.init?.headers).get('Content-Type')).toBe('image/png');
    expect(Buffer.from(putCall.init?.body as Buffer).equals(fixture)).toBe(true);
  });

  it('T13-07 never reuses the old expired upload authorization', async () => {
    const scenario = setup();
    await scenario.run();
    expect(scenario.network.calls.some((call) => call.url === OLD_EXPIRED_UPLOAD)).toBe(false);
    expect(scenario.network.calls[2]?.url).toBe(UPLOAD);
  });

  it('T13-08 trusted identity mismatch is MEDIA_SAFETY_FAILURE and stops before presign', async () => {
    const scenario = setup([
      json({ valid: true, email: 'wrong@example.invalid' }, 200, { 'x-request-id': 'auth-wrong' }),
    ]);
    const result = await scenario.run();
    expect(result.classification).toBe('MEDIA_SAFETY_FAILURE');
    expect(result.errorCategory).toBe('SAFETY_IDENTITY_MISMATCH');
    expect(scenario.network.calls).toHaveLength(1);
  });

  it('T13-09 a failed fresh presign is FRESH_MEDIA_PRESIGN_BLOCKED with no PUT/GET', async () => {
    const scenario = setup([
      json({ valid: true, email: EMAIL }, 200, { 'x-request-id': 'auth' }),
      json({ error: 'blocked' }, 503, { 'x-request-id': 'presign-blocked' }),
    ]);
    const result = await scenario.run();
    expect(result.classification).toBe('FRESH_MEDIA_PRESIGN_BLOCKED');
    expect(result.counters.freshPresigns).toBe(1);
    expect(result.counters.cloudPuts).toBe(0);
    expect(result.counters.publicGets).toBe(0);
    expect(scenario.network.calls).toHaveLength(2);
  });

  it('T13-10 incomplete or request-id-less fresh presign cannot proceed', async () => {
    const scenario = setup([
      json({ valid: true, email: EMAIL }, 200, { 'x-request-id': 'auth' }),
      json(presign({ publicUrl: '' }), 200),
    ]);
    const result = await scenario.run();
    expect(result.classification).toBe('FRESH_MEDIA_PRESIGN_BLOCKED');
    expect(result.errorCategory).toBe('PRESIGN_RESPONSE_INCOMPLETE');
    expect(scenario.network.calls).toHaveLength(2);
  });

  it('T13-11 unsafe fresh presign target fails closed before upload', async () => {
    const unsafe = `https://evil.example/${KEY}?X-Amz-Signature=${SIGNATURE}`;
    const scenario = setup([
      json({ valid: true, email: EMAIL }, 200, { 'x-request-id': 'auth' }),
      json(presign({ uploadUrl: unsafe }), 200, { 'x-request-id': 'presign' }),
    ]);
    const result = await scenario.run();
    expect(result.classification).toBe('MEDIA_SAFETY_FAILURE');
    expect(result.errorCategory).toBe('SAFETY_UNEXPECTED_PRESIGN_TARGET');
    expect(result.counters.cloudPuts).toBe(0);
  });

  it('T13-12 failed re-upload PUT is APPROVED_ORIGINAL_REUPLOAD_BLOCKED with no retry', async () => {
    const scenario = setup([
      json({ valid: true, email: EMAIL }, 200, { 'x-request-id': 'auth' }),
      json(presign(), 200, { 'x-request-id': 'presign' }),
      new Response('', { status: 500 }),
    ]);
    const result = await scenario.run();
    expect(result.classification).toBe('APPROVED_ORIGINAL_REUPLOAD_BLOCKED');
    expect(result.counters.cloudPuts).toBe(1);
    expect(result.counters.retries).toBe(0);
    expect(result.counters.publicGets).toBe(0);
    expect(scenario.network.calls).toHaveLength(3);
  });

  it('T13-13 failed public read is APPROVED_ORIGINAL_REUPLOAD_BLOCKED', async () => {
    const scenario = setup([
      json({ valid: true, email: EMAIL }, 200, { 'x-request-id': 'auth' }),
      json(presign(), 200, { 'x-request-id': 'presign' }),
      new Response('', { status: 200 }),
      new Response('', { status: 404 }),
    ]);
    const result = await scenario.run();
    expect(result.classification).toBe('APPROVED_ORIGINAL_REUPLOAD_BLOCKED');
    expect(result.counters.publicGets).toBe(1);
    expect(scenario.network.calls).toHaveLength(4);
  });

  it('T13-14 exact public binary equality is required for PASS', async () => {
    const scenario = setup([
      json({ valid: true, email: EMAIL }, 200, { 'x-request-id': 'auth' }),
      json(presign(), 200, { 'x-request-id': 'presign' }),
      new Response('', { status: 200 }),
      new Response(Buffer.from('not-the-approved-original'), { status: 200 }),
    ]);
    const result = await scenario.run();
    expect(result.classification).toBe('APPROVED_ORIGINAL_REUPLOAD_BLOCKED');
    expect(result.errorCategory).toBe('PUBLIC_BINARY_MISMATCH');
    expect(result.publicRead.exactMatch).toBe(false);
  });

  it('T13-15 durable evidence write failure is MEDIA_EVIDENCE_CAPTURE_FAILURE before upload', async () => {
    const scenario = setup();
    scenario.journal.failStage = 'FRESH_PRESIGN_RECEIVED';
    const result = await scenario.run();
    expect(result.classification).toBe('MEDIA_EVIDENCE_CAPTURE_FAILURE');
    expect(result.counters.cloudPuts).toBe(0);
    expect(scenario.network.calls).toHaveLength(2);
  });

  it('T13-16 duplicate live launch guard fails closed with zero network', async () => {
    const journal = new MemoryJournal();
    const network = makeFetch([]);
    const result = await runP1T13({
      live: true,
      env: env(),
      fetchImpl: network.fetchImpl,
      journal,
      pidGuard: new Guard(false),
    });
    expect(result.classification).toBe('MEDIA_SAFETY_FAILURE');
    expect(result.errorCategory).toBe('SAFETY_DUPLICATE_LIVE_LAUNCH_OR_STALE_PID');
    expect(network.calls).toHaveLength(0);
    expect(journal.initialized).toBe(false);
  });

  it('T13-17 fixed durable evidence contains safe metadata only', async () => {
    const network = makeFetch(happyResponses());
    const result = await runP1T13({
      live: true,
      env: env(),
      fetchImpl: network.fetchImpl,
      now: () => 1_800_000_000_000,
      journal: new FixedEvidenceJournal(() => 1_800_000_000_000),
      pidGuard: new Guard(),
    });
    expect(result.result).toBe('PASS');
    const evidence = await readFile(P1_T13_EVIDENCE_PATH, 'utf8');
    expect(evidence).not.toContain(UPLOAD);
    expect(evidence).not.toContain(SIGNATURE);
    expect(evidence).not.toContain(API_KEY);
    expect(evidence).not.toContain(EMAIL);
    expect(evidence).not.toContain('"Authorization":');
    expect(evidence).not.toContain('Bearer ');
    expect(evidence).toContain('"signedQueryPresent":true');
    expect(evidence).toContain(KEY);
  });

  it('T13-18 fixed evidence sanitizer rejects signed-query material', async () => {
    const journal = new FixedEvidenceJournal(() => 1_800_000_000_000);
    await journal.initialize();
    const counters: P1T13Counters = {
      zernioApiCalls: 0,
      freshPresigns: 0,
      cloudPuts: 0,
      publicGets: 0,
      networkCalls: 0,
      secondPresign: 0,
      retries: 0,
      socialMutations: 0,
    };
    await expect(
      journal.append('RUN_STARTED', counters, { leaked: `X-Amz-Signature=${SIGNATURE}` }, []),
    ).rejects.toThrow();
  });

  it('T13-19 runner has no social/publish/DM/comment/Ads/webhook or permanent endpoint surface', async () => {
    const source = await readFile('src/provider-spike/p1-t13-runner.ts', 'utf8');
    for (const forbiddenEndpoint of ['/v1/posts', '/v1/comments', '/v1/inbox', '/v1/ads', '/v1/webhooks']) {
      expect(source).not.toContain(forbiddenEndpoint);
    }
    expect(source).not.toContain('permanent: true');
    expect(source).not.toContain('permanent=true');
  });

  it('T13-20 success proves fresh authorization metadata without claiming URL difference', async () => {
    const scenario = setup();
    const result = await scenario.run();
    expect(result.presign.status).toBe(200);
    expect(result.presign.requestId).toBe('presign-p1t13');
    expect(result.presign.expiresIn).toBe(3600);
    expect(result.presign.issuedAt).toBe(new Date(1_800_000_000_000).toISOString());
    const row = scenario.journal.rows.find((entry) => entry.stage === 'FRESH_PRESIGN_RECEIVED');
    expect(row?.freshAuthorizationIssued).toBe(true);
    expect(result.fullSignedUrlPersisted).toBe(0);
    expect(result.signedQueryPersisted).toBe(0);
    expect(result.secretsPersisted).toBe(0);
    expect(result.permanentUploads).toBe(0);
  });
});
