import { mkdir, open } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  parseP1T15Args,
  runP1T15,
  type P1T15Journal,
  type P1T15RunOptions,
  type P1T15Stage,
} from './p1-t15-runner.js';

export const P1_T15_R02_EVIDENCE_PATH='artifacts/provider-spike/p1-t15-r02-evidence.jsonl';
type Obj=Record<string,unknown>;

function sensitive(serialized:string,forbidden:string[]){
  return /Authorization\s*[:=]|Bearer\s+[A-Za-z0-9._~+\/-]+|commenter(?:Id|Name)|recipient(?:Id|Name)|commentText/i.test(serialized)
    || forbidden.filter(Boolean).some(value=>serialized.includes(value));
}

export class FixedP1T15R02Journal implements P1T15Journal{
  private sequence=0;
  async initialize(forbidden:string[]){
    await mkdir(dirname(P1_T15_R02_EVIDENCE_PATH),{recursive:true});
    try{
      const handle=await open(P1_T15_R02_EVIDENCE_PATH,'wx');
      await handle.sync();
      await handle.close();
    }catch(error){
      throw new Error((error as NodeJS.ErrnoException).code==='EEXIST'?'SAFETY_EVIDENCE_FILE_ALREADY_EXISTS':'EVIDENCE_FILE_INIT_FAILED');
    }
    if(sensitive(P1_T15_R02_EVIDENCE_PATH,forbidden))throw new Error('SAFETY_EVIDENCE_PATH_INVALID');
  }
  async append(stage:P1T15Stage,fields:Obj,forbidden:string[]){
    const line=JSON.stringify({sequence:++this.sequence,utcTimestamp:new Date().toISOString(),stage,...fields});
    if(sensitive(line,forbidden))throw new Error('SAFETY_EVIDENCE_SECRET_OR_PII_LEAK_PREVENTED');
    const handle=await open(P1_T15_R02_EVIDENCE_PATH,'a');
    const bytes=Buffer.from(`${line}\n`,'utf8');
    const write=await handle.write(bytes,0,bytes.length,null);
    if(write.bytesWritten!==bytes.length){await handle.close();throw new Error('EVIDENCE_PARTIAL_WRITE');}
    await handle.sync();
    await handle.close();
  }
}

export async function runP1T15R02(options:P1T15RunOptions={}){
  return runP1T15({...options,journal:options.journal??new FixedP1T15R02Journal()});
}

async function main(){
  const parsed=parseP1T15Args(process.argv.slice(2));
  if(!parsed.ok){
    console.log(JSON.stringify({liveEnabled:false,result:'BLOCKED',classification:'NATIVE_AUTOMATION_STATE_TRANSITION_BLOCKED',errorCategory:'INVALID_P1_T15_R02_ARGUMENTS',providerRequests:0}));
    process.exitCode=2;
    return;
  }
  const result=await runP1T15R02({live:parsed.live,env:process.env});
  console.log(JSON.stringify(result,null,2));
  process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
