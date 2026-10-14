import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { runP1T08F06 } from './p1-t08-f06-zernio.js';

const live=process.argv.includes('--live');
if(live&&existsSync('.env')&&(!process.env.ZERNIO_API_KEY||!process.env.ZERNIO_EXPECTED_USER_EMAIL))loadEnvFile('.env');

const result=await runP1T08F06({live,env:process.env,providerEnvironment:'authorized-internal-zernio-test-team'});
const safe={
 liveEnabled:result.liveEnabled,result:result.result,errorCategory:result.errorCategory,identityMatch:result.identityMatch,
 providerContract:result.providerContract,
 preflight:result.preflight?{runId:result.preflight.evidence.run_id,timestamp:result.preflight.evidence.timestamp,result:result.preflight.evidence.result,status:result.preflight.evidence.provider_status,requestId:result.preflight.evidence.provider_request_id,latencyMs:result.preflight.evidence.latency_ms}:null,
 target:result.target,health:result.health,baseline:result.baseline,primaryClassification:result.primaryClassification,syncCycleState:result.syncCycleState,recommendation:result.recommendation,
 normalRequestCount:result.normalRequestCount,cleanupRequestCount:result.cleanupRequestCount,liveRequestCount:result.liveRequestCount,mutations:result.mutations,steps:result.steps
};
console.log(JSON.stringify(safe,null,2));
process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;
