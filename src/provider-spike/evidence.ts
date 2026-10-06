import type { ProviderSpikeEvidence } from './types.js';
export function validateEvidenceRecord(value:unknown):ProviderSpikeEvidence{
 if(typeof value!=='object'||value===null||Array.isArray(value))throw new Error('Evidence must be an object.'); const v=value as Record<string,unknown>;
 for(const k of ['run_id','test_id','provider','capability','timestamp','provider_environment'])if(typeof v[k]!=='string'||!(v[k] as string).trim())throw new Error(`Evidence field ${k} is required.`);
 if(!['PASS','FAIL','BLOCKED'].includes(String(v.result)))throw new Error('Evidence result invalid.'); if(!['offline','live'].includes(String(v.execution_mode)))throw new Error('Evidence mode invalid.');
 if(typeof v.latency_ms!=='number'||v.latency_ms<0)throw new Error('Evidence latency invalid.'); if(!Number.isInteger(v.request_count)||Number(v.request_count)<0)throw new Error('Evidence request_count invalid.');
 if(typeof v.safe_response_headers!=='object'||v.safe_response_headers===null)throw new Error('Evidence headers invalid.'); if(!('safe_request_metadata' in v))throw new Error('Evidence safe_request_metadata required.');
 return value as ProviderSpikeEvidence;
}