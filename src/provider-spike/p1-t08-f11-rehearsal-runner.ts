import { randomBytes, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import {
  probeP1T08VpsReceiverHttps,
  startP1T08Receiver,
  type P1T08ReceiverController,
  type P1T08VpsReadinessEvidence,
} from './p1-t08-receiver.js';

export const P1_T08_F11_RHR01_HOST = '127.0.0.1';
export const P1_T08_F11_RHR01_PUBLIC_URL = 'https://marketlyai.restartorg.com/p1-t08-f11/analytics-synced';
export const P1_T08_F11_RHR01_WATCHDOG_MS = 5 * 60 * 1000;

const RECEIVER_PATH = new URL(P1_T08_F11_RHR01_PUBLIC_URL).pathname;
const DISABLED_TARGET = 'rhr01-no-provider-target';

type StopReason = 'signal' | 'controlled' | 'watchdog' | 'readiness-failed';
type StartReceiver = typeof startP1T08Receiver;
type ProbeReadiness = typeof probeP1T08VpsReceiverHttps;

export interface P1T08F11Rhr01Handle {
  port: number;
  readiness: P1T08VpsReadinessEvidence;
  receiver: P1T08ReceiverController;
  closed: Promise<StopReason>;
  close(reason?: StopReason): Promise<void>;
}

export function parseP1T08F11Rhr01Port(argv: string[]): number | null {
  const prefix = '--listen-port=';
  if (argv.length !== 1 || !argv[0]?.startsWith(prefix)) return null;
  const value = Number(argv[0].slice(prefix.length));
  return Number.isInteger(value) && value >= 1024 && value <= 65535 ? value : null;
}

export async function prepareP1T08F11Rhr01(
  port: number,
  options: {
    startReceiver?: StartReceiver;
    probeReadiness?: ProbeReadiness;
    watchdogMs?: number;
  } = {},
): Promise<P1T08F11Rhr01Handle> {
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('RHR01_INVALID_LOCAL_PORT');
  const startReceiver = options.startReceiver ?? startP1T08Receiver;
  const probeReadiness = options.probeReadiness ?? probeP1T08VpsReceiverHttps;
  const marker = `p1-t08-f11-rhr01-${randomUUID().replace(/-/g, '').slice(0, 20)}`;
  const secret = randomBytes(32).toString('hex');
  const receiver = await startReceiver({
    secret,
    expectedProfileId: DISABLED_TARGET,
    expectedAccountId: DISABLED_TARGET,
    expectedPlatform: 'facebook',
    host: P1_T08_F11_RHR01_HOST,
    port,
    path: RECEIVER_PATH,
    readinessMarker: marker,
  });

  let resolveClosed!: (reason: StopReason) => void;
  const closed = new Promise<StopReason>((resolve) => { resolveClosed = resolve; });
  let closing: Promise<void> | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const close = async (reason: StopReason = 'controlled') => {
    if (closing) return closing;
    closing = (async () => {
      if (timer) clearTimeout(timer);
      await receiver.close();
      resolveClosed(reason);
    })();
    return closing;
  };

  timer = setTimeout(() => { void close('watchdog'); }, options.watchdogMs ?? P1_T08_F11_RHR01_WATCHDOG_MS);
  const readiness = await probeReadiness(P1_T08_F11_RHR01_PUBLIC_URL, marker, { timeoutMs: 5000 });
  if (!readiness.ready) {
    await close('readiness-failed');
    throw new Error(`RHR01_READINESS_FAILED:${readiness.errorCategory ?? 'UNKNOWN'}`);
  }
  return { port, readiness, receiver, closed, close };
}

async function main() {
  const port = parseP1T08F11Rhr01Port(process.argv.slice(2));
  if (!port) {
    console.log(JSON.stringify({ phase: 'RHR01_BLOCKED', errorCategory: 'INVALID_LOCAL_PORT' }));
    process.exitCode = 2;
    return;
  }
  let handle: P1T08F11Rhr01Handle;
  try {
    handle = await prepareP1T08F11Rhr01(port);
  } catch (error) {
    console.log(JSON.stringify({ phase: 'RHR01_BLOCKED', errorCategory: error instanceof Error ? error.message : 'RHR01_FAILED' }));
    process.exitCode = 2;
    return;
  }

  const stop = () => { void handle.close('signal'); };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  console.log(JSON.stringify({
    phase: 'RHR01_READY',
    pid: process.pid,
    host: P1_T08_F11_RHR01_HOST,
    listenPort: handle.port,
    publicUrl: P1_T08_F11_RHR01_PUBLIC_URL,
    readiness: handle.readiness,
    snapshot: handle.receiver.snapshot(),
  }));
  const reason = await handle.closed;
  process.removeListener('SIGINT', stop);
  process.removeListener('SIGTERM', stop);
  console.log(JSON.stringify({ phase: 'RHR01_CLOSED', reason }));
  if (reason === 'watchdog') process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
