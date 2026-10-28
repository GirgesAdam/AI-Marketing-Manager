import { pathToFileURL } from 'node:url';
import {
  FixedP1T15R08Journal,
  P1_T15_R08_EVIDENCE_PATH,
  parseP1T15Args,
  runP1T15R08ReadbackDiagnostic,
  type P1T15RunOptions,
  type P1T15RunResult,
} from './p1-t15-runner.js';

export { FixedP1T15R08Journal, P1_T15_R08_EVIDENCE_PATH };
export const P1_T15_R08_TEST_EVIDENCE_PATH='artifacts/provider-spike/p1-t15-r08-test-evidence.jsonl';
export const P1_T15_R08_REQUEST_MAX=9;

export interface P1T15R08RunOptions extends P1T15RunOptions {
  /** Caller compatibility only; never grants R08 live authorization. */
  liveAuthorized?: boolean;
}

export function parseP1T15R08Args(argv:string[]){return parseP1T15Args(argv);}

function authorizationBlocked():P1T15RunResult{
  return{
    liveEnabled:false,
    result:'BLOCKED',
    classification:'NATIVE_AUTOMATION_STATE_TRANSITION_BLOCKED',
    errorCategory:'R08_LIVE_AUTHORIZATION_REQUIRED',
    recommendation:'Comment-to-DM remains SPIKE_PENDING',
    automationId:null,
    createDisabledAccepted:null,
    createdState:null,
    enabledState:null,
    finalDisabledState:null,
    triggerCount:null,
    sendCount:null,
    cleanup:'NOT_APPLICABLE',
    counters:{providerRequests:0,creates:0,enablePatches:0,disablePatches:0,deletes:0,commentsCreated:0,dmsSentIntentionally:0,conversationsCreated:0,adsMediaWebhookMutations:0,retries:0},
    requests:[],
    secretsPersisted:0,
    privatePiiPersisted:0,
  };
}

export async function runP1T15R08(options:P1T15R08RunOptions={}):Promise<P1T15RunResult>{
  if(options.live===true&&process.env.P1_T15_R08_LIVE_AUTHORIZED?.trim()!=='true')return authorizationBlocked();
  const {liveAuthorized:_liveAuthorized,...runOptions}=options;
  const requestedMax=runOptions.maxRequests;
  const boundedMax=typeof requestedMax==='number'&&Number.isFinite(requestedMax)?Math.min(P1_T15_R08_REQUEST_MAX,Math.max(1,Math.trunc(requestedMax))):P1_T15_R08_REQUEST_MAX;
  return runP1T15R08ReadbackDiagnostic({
    ...runOptions,
    maxRequests:boundedMax,
    captureReadbackDiagnostics:true,
    journal:runOptions.journal??new FixedP1T15R08Journal(),
  });
}

async function main(){
  const parsed=parseP1T15R08Args(process.argv.slice(2));
  if(!parsed.ok){
    console.log(JSON.stringify({liveEnabled:false,result:'BLOCKED',classification:'NATIVE_AUTOMATION_STATE_TRANSITION_BLOCKED',errorCategory:'INVALID_P1_T15_R08_ARGUMENTS',providerRequests:0}));
    process.exitCode=2;
    return;
  }
  const result=await runP1T15R08({live:parsed.live,env:process.env});
  console.log(JSON.stringify(result,null,2));
  process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
