import { runP1T02Profiles } from './p1-t02-zernio.js';

const live=process.argv.includes('--live');
const result=await runP1T02Profiles({live,env:process.env});
const safe={
 liveEnabled:result.liveEnabled,
 result:result.result,
 errorCategory:result.errorCategory,
 preflight:result.preflight?{result:result.preflight.evidence.result,errorCategory:result.preflight.evidence.error_category,requestCount:result.preflight.evidence.request_count,status:result.preflight.evidence.provider_status,requestId:result.preflight.evidence.provider_request_id}:null,
 profileA:result.profileA?{result:result.profileA.run.evidence.result,errorCategory:result.profileA.run.evidence.error_category,requestCount:result.profileA.run.evidence.request_count,status:result.profileA.run.evidence.provider_status,requestId:result.profileA.run.evidence.provider_request_id,outcome:result.profileA.outcome}:null,
 profileB:result.profileB?{result:result.profileB.run.evidence.result,errorCategory:result.profileB.run.evidence.error_category,requestCount:result.profileB.run.evidence.request_count,status:result.profileB.run.evidence.provider_status,requestId:result.profileB.run.evidence.provider_request_id,outcome:result.profileB.outcome}:null,
 distinctProfileIds:result.distinctProfileIds
};
console.log(JSON.stringify(safe,null,2));
process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;
