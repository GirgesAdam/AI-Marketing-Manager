import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { runP1T04 } from './p1-t04-zernio.js';

const live=process.argv.includes('--live');
const required=['ZERNIO_API_KEY','ZERNIO_EXPECTED_USER_EMAIL','ZERNIO_P1_T04_EXPECTED_FACEBOOK_ACCOUNT_ID','ZERNIO_P1_T04_EXPECTED_FACEBOOK_PAGE_ID','ZERNIO_P1_T04_ALLOW_PUBLIC_TEST'];
if(live&&existsSync('.env')&&required.some(name=>!process.env[name]))loadEnvFile('.env');

const result=await runP1T04({live,env:process.env,providerEnvironment:'authorized-internal-zernio-test-team'});
const safe={liveEnabled:result.liveEnabled,result:result.result,errorCategory:result.errorCategory,identityMatch:result.identityMatch,normalRequestCount:result.normalRequestCount,cleanupRequestCount:result.cleanupRequestCount,liveRequestCount:result.liveRequestCount,wrongTargetObserved:result.wrongTargetObserved,duplicateConfirmedPublishObserved:result.duplicateConfirmedPublishObserved,preflight:result.preflight?{runId:result.preflight.evidence.run_id,timestamp:result.preflight.evidence.timestamp,result:result.preflight.evidence.result,status:result.preflight.evidence.provider_status,requestId:result.preflight.evidence.provider_request_id,latencyMs:result.preflight.evidence.latency_ms}:null,key:result.key,target:result.target,draft:result.draft,scheduled:result.scheduled,immediate:result.immediate,keyCleanup:result.keyCleanup,steps:result.steps};
console.log(JSON.stringify(safe,null,2));
process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;
