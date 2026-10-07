import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { runP1T03 } from './p1-t03-zernio.js';

const live=process.argv.includes('--live');
if(live&&existsSync('.env')&&(!process.env.ZERNIO_API_KEY||!process.env.ZERNIO_EXPECTED_USER_EMAIL))loadEnvFile('.env');

const result=await runP1T03({live,env:process.env,providerEnvironment:'authorized-internal-zernio-test-team'});
const safe={
 liveEnabled:result.liveEnabled,result:result.result,errorCategory:result.errorCategory,identityMatch:result.identityMatch,liveRequestCount:result.liveRequestCount,crossProfileLeakageObserved:result.crossProfileLeakageObserved,
 preflight:result.preflight?{runId:result.preflight.evidence.run_id,timestamp:result.preflight.evidence.timestamp,result:result.preflight.evidence.result,status:result.preflight.evidence.provider_status,requestId:result.preflight.evidence.provider_request_id,latencyMs:result.preflight.evidence.latency_ms}:null,
 keyA:result.keyA,keyB:result.keyB,isolationA:result.isolationA,isolationB:result.isolationB,cleanup:result.cleanup
};
console.log(JSON.stringify(safe,null,2));
process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;
