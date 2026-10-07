import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { runProviderSpikeCase } from './harness.js';
import { createP1T02TeamPreflightCase, createZernioLiveTransport, runP1T02Profiles } from './p1-t02-zernio.js';

const live=process.argv.includes('--live');
const preflightOnly=process.argv.includes('--preflight-only');
if(live&&!process.env.ZERNIO_API_KEY&&existsSync('.env'))loadEnvFile('.env');

if(preflightOnly){
 if(!live){console.log(JSON.stringify({liveEnabled:false,result:'BLOCKED',errorCategory:'LIVE_OPT_IN_REQUIRED'},null,2));process.exitCode=2;}
 else{
  const env=process.env;const transport=env.ZERNIO_API_KEY?createZernioLiveTransport(env.ZERNIO_API_KEY):undefined;
  const run=await runProviderSpikeCase(createP1T02TeamPreflightCase('live','authorized-internal-zernio-test-team'),{env,...(transport?{transport}:{})});
  console.log(JSON.stringify({liveEnabled:true,result:run.evidence.result,errorCategory:run.evidence.error_category,runId:run.evidence.run_id,timestamp:run.evidence.timestamp,requestCount:run.evidence.request_count,status:run.evidence.provider_status,requestId:run.evidence.provider_request_id,latencyMs:run.evidence.latency_ms,safeResponseHeaders:run.evidence.safe_response_headers},null,2));
  process.exitCode=run.exitCode;
 }
}else{
 const result=await runP1T02Profiles({live,env:process.env,providerEnvironment:'authorized-internal-zernio-test-team'});
 const safe={liveEnabled:result.liveEnabled,result:result.result,errorCategory:result.errorCategory,preflight:result.preflight?{runId:result.preflight.evidence.run_id,timestamp:result.preflight.evidence.timestamp,result:result.preflight.evidence.result,errorCategory:result.preflight.evidence.error_category,requestCount:result.preflight.evidence.request_count,status:result.preflight.evidence.provider_status,requestId:result.preflight.evidence.provider_request_id,latencyMs:result.preflight.evidence.latency_ms}:null,profileA:result.profileA?{runId:result.profileA.run.evidence.run_id,timestamp:result.profileA.run.evidence.timestamp,result:result.profileA.run.evidence.result,errorCategory:result.profileA.run.evidence.error_category,requestCount:result.profileA.run.evidence.request_count,status:result.profileA.run.evidence.provider_status,requestId:result.profileA.run.evidence.provider_request_id,latencyMs:result.profileA.run.evidence.latency_ms,outcome:result.profileA.outcome}:null,profileB:result.profileB?{runId:result.profileB.run.evidence.run_id,timestamp:result.profileB.run.evidence.timestamp,result:result.profileB.run.evidence.result,errorCategory:result.profileB.run.evidence.error_category,requestCount:result.profileB.run.evidence.request_count,status:result.profileB.run.evidence.provider_status,requestId:result.profileB.run.evidence.provider_request_id,latencyMs:result.profileB.run.evidence.latency_ms,outcome:result.profileB.outcome}:null,distinctProfileIds:result.distinctProfileIds};
 console.log(JSON.stringify(safe,null,2));
 process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;
}
