import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { runP1T02F01Verification } from './p1-t02-zernio.js';

const live=process.argv.includes('--live');
if(live&&existsSync('.env')&&(!process.env.ZERNIO_API_KEY||!process.env.ZERNIO_EXPECTED_USER_EMAIL))loadEnvFile('.env');

const result=await runP1T02F01Verification({live,env:process.env,providerEnvironment:'authorized-internal-zernio-test-team'});
const safe={
 liveEnabled:result.liveEnabled,
 result:result.result,
 errorCategory:result.errorCategory,
 identity:result.identityRun?{runId:result.identityRun.evidence.run_id,timestamp:result.identityRun.evidence.timestamp,result:result.identityRun.evidence.result,errorCategory:result.identityRun.evidence.error_category,requestCount:result.identityRun.evidence.request_count,status:result.identityRun.evidence.provider_status,requestId:result.identityRun.evidence.provider_request_id,latencyMs:result.identityRun.evidence.latency_ms,expectedIdentityMatch:result.identity?.expectedIdentityMatch??false}:null,
 profileA:result.profileA?{runId:result.profileA.run.evidence.run_id,timestamp:result.profileA.run.evidence.timestamp,result:result.profileA.run.evidence.result,errorCategory:result.profileA.run.evidence.error_category,requestCount:result.profileA.run.evidence.request_count,status:result.profileA.run.evidence.provider_status,requestId:result.profileA.run.evidence.provider_request_id,latencyMs:result.profileA.run.evidence.latency_ms,outcome:result.profileA.outcome}:null,
 profileB:result.profileB?{runId:result.profileB.run.evidence.run_id,timestamp:result.profileB.run.evidence.timestamp,result:result.profileB.run.evidence.result,errorCategory:result.profileB.run.evidence.error_category,requestCount:result.profileB.run.evidence.request_count,status:result.profileB.run.evidence.provider_status,requestId:result.profileB.run.evidence.provider_request_id,latencyMs:result.profileB.run.evidence.latency_ms,outcome:result.profileB.outcome}:null,
 distinctProfileIds:result.distinctProfileIds
};
console.log(JSON.stringify(safe,null,2));
process.exitCode=result.result==='PASS'?0:2;
