import { mkdir, open } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  parseP1T15Args,
  P1_T15_R03_JOURNAL_BRAND,
  runP1T15ReadbackDiagnostic,
  type P1T15R03Journal,
  type P1T15RunOptions,
  type P1T15RunResult,
  type P1T15Stage,
} from './p1-t15-runner.js';

export const P1_T15_R03_EVIDENCE_PATH='artifacts/provider-spike/p1-t15-r03-evidence.jsonl';

type Obj=Record<string,unknown>;
export interface P1T15R03RunOptions extends P1T15RunOptions {
  /**
   * Legacy compatibility field only. It is never an authorization source;
   * real R03 live execution requires process.env.P1_T15_R03_LIVE_AUTHORIZED=true.
   */
  liveAuthorized?: boolean;
}

function sensitive(serialized:string,forbidden:string[]){
  return /Authorization\s*[:=]|Bearer\s+[A-Za-z0-9._~+\/-]+|commenter(?:Id|Name)|recipient(?:Id|Name)|commentText/i.test(serialized)
    || forbidden.filter(Boolean).some(value=>serialized.includes(value));
}

export class FixedP1T15R03Journal implements P1T15R03Journal{
  readonly [P1_T15_R03_JOURNAL_BRAND]='fixed' as const;
  private sequence=0;
  async initialize(forbidden:string[]){
    await mkdir(dirname(P1_T15_R03_EVIDENCE_PATH),{recursive:true});
    try{
      const handle=await open(P1_T15_R03_EVIDENCE_PATH,'wx');
      await handle.sync();
      await handle.close();
    }catch(error){
      throw new Error((error as NodeJS.ErrnoException).code==='EEXIST'?'SAFETY_EVIDENCE_FILE_ALREADY_EXISTS':'EVIDENCE_FILE_INIT_FAILED');
    }
    if(sensitive(P1_T15_R03_EVIDENCE_PATH,forbidden))throw new Error('SAFETY_EVIDENCE_PATH_INVALID');
  }
  async append(stage:P1T15Stage,fields:Obj,forbidden:string[]){
    const line=JSON.stringify({sequence:++this.sequence,utcTimestamp:new Date().toISOString(),stage,...fields});
    if(sensitive(line,forbidden))throw new Error('SAFETY_EVIDENCE_SECRET_OR_PII_LEAK_PREVENTED');
    const handle=await open(P1_T15_R03_EVIDENCE_PATH,'a');
    const bytes=Buffer.from(`${line}\n`,'utf8');
    const write=await handle.write(bytes,0,bytes.length,null);
    if(write.bytesWritten!==bytes.length){await handle.close();throw new Error('EVIDENCE_PARTIAL_WRITE');}
    await handle.sync();
    await handle.close();
  }
}

function authorizationBlocked():P1T15RunResult{
  return{
    liveEnabled:false,
    result:'BLOCKED',
    classification:'NATIVE_AUTOMATION_STATE_TRANSITION_BLOCKED',
    errorCategory:'R03_LIVE_AUTHORIZATION_REQUIRED',
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

export async function runP1T15R03(options:P1T15R03RunOptions={}):Promise<P1T15RunResult>{
  if(options.live===true&&process.env.P1_T15_R03_LIVE_AUTHORIZED?.trim()!=='true')return authorizationBlocked();
  const {liveAuthorized:_liveAuthorized,...runOptions}=options;
  const requestedMax=runOptions.maxRequests;
  const boundedMax=typeof requestedMax==='number'&&Number.isFinite(requestedMax)?Math.min(9,Math.max(1,Math.trunc(requestedMax))):9;
  return runP1T15ReadbackDiagnostic({
    ...runOptions,
    maxRequests:boundedMax,
    captureReadbackDiagnostics:true,
    journal:runOptions.journal??new FixedP1T15R03Journal(),
  });
}

async function main(){
  const parsed=parseP1T15Args(process.argv.slice(2));
  if(!parsed.ok){
    console.log(JSON.stringify({liveEnabled:false,result:'BLOCKED',classification:'NATIVE_AUTOMATION_STATE_TRANSITION_BLOCKED',errorCategory:'INVALID_P1_T15_R03_ARGUMENTS',providerRequests:0}));
    process.exitCode=2;
    return;
  }
  const result=await runP1T15R03({live:parsed.live,env:process.env});
  console.log(JSON.stringify(result,null,2));
  process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
