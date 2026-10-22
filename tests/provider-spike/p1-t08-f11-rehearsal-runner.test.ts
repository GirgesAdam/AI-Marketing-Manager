import { readFile } from 'node:fs/promises';
import { describe, expect, it, vi } from 'vitest';
import type { P1T08ReceiverController, P1T08ReceiverSnapshot, P1T08VpsReadinessEvidence } from '../../src/provider-spike/p1-t08-receiver.js';
import {
  P1_T08_F11_RHR01_HOST,
  P1_T08_F11_RHR01_PUBLIC_URL,
  parseP1T08F11Rhr01Port,
  prepareP1T08F11Rhr01,
} from '../../src/provider-spike/p1-t08-f11-rehearsal-runner.js';

function snapshot(): P1T08ReceiverSnapshot {
  return {
    deliveries: [],
    validAnalyticsDeliveries: 0,
    logicalUniqueAnalyticsEvents: 0,
    foreignTargetObserved: false,
    wrongPlatformObserved: false,
    targetUnconfirmedObserved: false,
    unexpectedEventDelivery: false,
    readinessHits: 1,
    readinessConfirmedHits: 1,
  };
}

function receiver(close = vi.fn(async () => {})): P1T08ReceiverController {
  return {
    port: 18765,
    localUrl: 'http://127.0.0.1:18765/p1-t08-f11/analytics-synced',
    receiverPath: '/p1-t08-f11/analytics-synced',
    readinessMarker: 'marker',
    snapshot,
    waitForAnalytics: async () => null,
    waitForReadiness: async () => true,
    close,
  };
}

function readiness(ready = true): P1T08VpsReadinessEvidence {
  return {
    ready,
    hostname: 'marketlyai.restartorg.com',
    path: '/p1-t08-f11/analytics-synced',
    httpStatus: ready ? 401 : 404,
    tlsSuccess: true,
    receiverMarkerMatch: ready,
    receiverConfirmed: ready,
    redirected: false,
    latencyMs: 1,
    timestamp: '2026-10-22T00:00:00.000Z',
    errorCategory: ready ? null : 'VPS_READINESS_WRONG_HANDLER',
  };
}

describe('P1-T08-F11 RHR01 provider-free rehearsal runner', () => {
  it('rejects missing, extra, privileged, oversized, non-integer, and nonnumeric ports', () => {
    for (const argv of [[], ['--listen-port=1023'], ['--listen-port=65536'], ['--listen-port=18765.5'], ['--listen-port=x'], ['--listen-port=18765', '--other=x']]) {
      expect(parseP1T08F11Rhr01Port(argv)).toBeNull();
    }
    expect(parseP1T08F11Rhr01Port(['--listen-port=18765'])).toBe(18765);
  });

  it('fixes local bind host and public route and accepts only the local port from caller input', async () => {
    const startReceiver = vi.fn(async (options) => receiver());
    const probeReadiness = vi.fn(async () => readiness());
    const handle = await prepareP1T08F11Rhr01(18765, { startReceiver: startReceiver as any, probeReadiness: probeReadiness as any, watchdogMs: 60_000 });
    expect(P1_T08_F11_RHR01_HOST).toBe('127.0.0.1');
    expect(P1_T08_F11_RHR01_PUBLIC_URL).toBe('https://marketlyai.restartorg.com/p1-t08-f11/analytics-synced');
    expect(startReceiver).toHaveBeenCalledTimes(1);
    expect(startReceiver.mock.calls[0]![0]).toMatchObject({ host: '127.0.0.1', port: 18765, path: '/p1-t08-f11/analytics-synced' });
    expect(probeReadiness).toHaveBeenCalledWith(P1_T08_F11_RHR01_PUBLIC_URL, expect.stringMatching(/^p1-t08-f11-rhr01-/), { timeoutMs: 5000 });
    await handle.close();
  });

  it('closes the local receiver when readiness fails', async () => {
    const close = vi.fn(async () => {});
    const startReceiver = vi.fn(async () => receiver(close));
    const probeReadiness = vi.fn(async () => readiness(false));
    await expect(prepareP1T08F11Rhr01(18765, { startReceiver: startReceiver as any, probeReadiness: probeReadiness as any, watchdogMs: 60_000 })).rejects.toThrow('RHR01_READINESS_FAILED');
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('graceful controlled close is idempotent and frees the receiver once', async () => {
    const close = vi.fn(async () => {});
    const handle = await prepareP1T08F11Rhr01(18765, {
      startReceiver: (async () => receiver(close)) as any,
      probeReadiness: (async () => readiness()) as any,
      watchdogMs: 60_000,
    });
    await handle.close('controlled');
    await handle.close('controlled');
    await expect(handle.closed).resolves.toBe('controlled');
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('watchdog closes an orphaned receiver', async () => {
    vi.useFakeTimers();
    try {
      const close = vi.fn(async () => {});
      const handle = await prepareP1T08F11Rhr01(18765, {
        startReceiver: (async () => receiver(close)) as any,
        probeReadiness: (async () => readiness()) as any,
        watchdogMs: 10,
      });
      await vi.advanceTimersByTimeAsync(11);
      await expect(handle.closed).resolves.toBe('watchdog');
      expect(close).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('source has no credential loading or provider execution import path', async () => {
    const source = await readFile(new URL('../../src/provider-spike/p1-t08-f11-rehearsal-runner.ts', import.meta.url), 'utf8');
    for (const forbidden of ['loadEnvFile', "'.env'", '".env"', 'ZERNIO_API_KEY', 'ZERNIO_EXPECTED_USER_EMAIL', 'p1-t08-f10-zernio', 'p1-t08-zernio', 'p1-t08-f07-zernio', '/v1/auth/verify', '/v1/analytics', '/v1/webhooks/settings', '/v1/posts']) {
      expect(source).not.toContain(forbidden);
    }
    expect(source).not.toContain('--url=');
    expect(source).toContain("from './p1-t08-receiver.js'");
  });
});
