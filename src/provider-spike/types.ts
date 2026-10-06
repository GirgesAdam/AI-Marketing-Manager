export type SpikeResult = 'PASS' | 'FAIL' | 'BLOCKED';
export type ExecutionMode = 'offline' | 'live';
export type SanitizedValue = null | string | number | boolean | SanitizedValue[] | { [key: string]: SanitizedValue };

export interface ProviderTransportRequest { method?: string; url?: string; headers?: Record<string,string>; body?: unknown; safeMetadata?: unknown; }
export interface ProviderTransportResponse { status?: number | string; headers?: Record<string,string | undefined>; body?: unknown; }
export interface ProviderTransport { kind: 'mock' | 'live'; send(request: ProviderTransportRequest, context: { signal: AbortSignal }): Promise<ProviderTransportResponse>; }
export interface LiveTokenLimits { maxInputTokens: number; maxOutputTokens: number; }
export interface LiveSafetyConfig { enabled: boolean; maxDevelopmentCostUsd?: number; estimatedRunCostUsd?: number; tokenLimits?: LiveTokenLimits; }
export interface PrerequisiteResult { ok: boolean; reason?: string; }
export interface ProviderSpikeExecutionContext { readonly mode: ExecutionMode; readonly testConfig: Readonly<Record<string,unknown>>; request(request: ProviderTransportRequest): Promise<ProviderTransportResponse>; }
export interface ProviderSpikeTestCase {
  testId: string; provider: string; capability: string; providerEnvironment: string; mode?: ExecutionMode; timeoutMs?: number; maxRequests?: number;
  testConfig?: Readonly<Record<string,unknown>>; safeResponseHeaders?: readonly string[]; requestIdExtractor?: (response: ProviderTransportResponse) => string | undefined;
  requiredCredentialEnvVars?: readonly string[]; liveSafety?: LiveSafetyConfig; mayIncurCost?: boolean; requiresTokenLimits?: boolean; version?: string; notes?: readonly string[];
  prerequisite?: () => PrerequisiteResult | Promise<PrerequisiteResult>; execute(context: ProviderSpikeExecutionContext): Promise<unknown>; assert(observation: unknown, context: ProviderSpikeExecutionContext): boolean | Promise<boolean>;
}
export interface ProviderSpikeEvidence {
  run_id: string; test_id: string; provider: string; capability: string; timestamp: string; provider_environment: string; safe_request_metadata: SanitizedValue;
  provider_status: number | string | null; safe_response_headers: Record<string,string>; provider_request_id: string | null; latency_ms: number; result: SpikeResult;
  error_category: string | null; notes: string[]; request_count: number; execution_mode: ExecutionMode; test_case_version: string | null;
}
export interface ProviderSpikeRunOptions { transport?: ProviderTransport; env?: NodeJS.ProcessEnv; redactionSecrets?: readonly string[]; serializer?: (evidence: ProviderSpikeEvidence) => string; evidenceWriter?: (serializedEvidence: string, evidence: ProviderSpikeEvidence) => void | Promise<void>; }
export interface ProviderSpikeRunResult { exitCode: 0 | 1 | 2; summary: string; machineReadableEvidence: string; evidence: ProviderSpikeEvidence; errorOutput: string | null; }