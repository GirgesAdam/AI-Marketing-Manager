import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { P1_T07_PROVIDER_CONTRACTS, runP1T07 } from './p1-t07-zernio.js';

const live=process.argv.includes('--live');
if(live&&existsSync('.env')&&(!process.env.ZERNIO_API_KEY||!process.env.ZERNIO_EXPECTED_USER_EMAIL))loadEnvFile('.env');

const result=await runP1T07({live,env:process.env,providerEnvironment:'authorized-internal-zernio-test-team'});
const safe={
 liveEnabled:result.liveEnabled,result:result.result,errorCategory:result.errorCategory,identityMatch:result.identityMatch,
 providerContracts:P1_T07_PROVIDER_CONTRACTS,
 preflight:result.preflight?{runId:result.preflight.evidence.run_id,timestamp:result.preflight.evidence.timestamp,result:result.preflight.evidence.result,status:result.preflight.evidence.provider_status,requestId:result.preflight.evidence.provider_request_id,latencyMs:result.preflight.evidence.latency_ms}:null,
 key:result.key,target:result.target,bestTimes:result.bestTimes,performanceDecay:result.performanceDecay,frequencyAnalysis:result.frequencyAnalysis,
 foreignProfileOrAccountObserved:result.foreignProfileOrAccountObserved,cleanup:result.cleanup,rateLimit:result.rateLimit,
 normalRequestCount:result.normalRequestCount,cleanupRequestCount:result.cleanupRequestCount,liveRequestCount:result.liveRequestCount,
 steps:result.steps,overallRecommendation:result.overallRecommendation
};
console.log(JSON.stringify(safe,null,2));
process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;
