import { afterEach, describe, expect, it, vi } from 'vitest';

const {R08_LIVE_PATH,R08_TEST_PATH,R03_HISTORICAL_PATH,fsAudit}=vi.hoisted(()=>({
  R08_LIVE_PATH:'artifacts/provider-spike/p1-t15-r08-evidence.jsonl',
  R08_TEST_PATH:'artifacts/provider-spike/p1-t15-r08-test-evidence.jsonl',
  R03_HISTORICAL_PATH:'artifacts/provider-spike/p1-t15-r03-evidence.jsonl',
  fsAudit:[] as Array<{operation:'open'|'readFile'|'rm';requestedPath:string;effectivePath:string;flags?:string}>,
}));

vi.mock('node:fs/promises',async(importOriginal)=>{
  const actual=await importOriginal<typeof import('node:fs/promises')>();
  const remap=(path:unknown)=>path===R08_LIVE_PATH?R08_TEST_PATH:path;
  const text=(path:unknown)=>typeof path==='string'?path:String(path);
  const audit=(operation:'open'|'readFile'|'rm',path:unknown,effective:unknown,flags?:unknown)=>fsAudit.push({operation,requestedPath:text(path),effectivePath:text(effective),...(flags===undefined?{}:{flags:String(flags)})});
  return{
    ...actual,
    open:((path:unknown,...args:unknown[])=>{const effective=remap(path);audit('open',path,effective,args[0]);return actual.open(effective as any,...args as any);}) as typeof actual.open,
    readFile:((path:unknown,...args:unknown[])=>{const effective=remap(path);audit('readFile',path,effective);return actual.readFile(effective as any,...args as any);}) as typeof actual.readFile,
    rm:((path:unknown,...args:unknown[])=>{const effective=remap(path);audit('rm',path,effective);return actual.rm(effective as any,...args as any);}) as typeof actual.rm,
  };
});

import { open, readFile, rm } from 'node:fs/promises';
import type { ProviderTransport, ProviderTransportRequest, ProviderTransportResponse } from '../../src/provider-spike/types.js';
import {
  P1_T15_ACCOUNT_ID,
  P1_T15_AUTOMATION_NAME,
  P1_T15_DM_MESSAGE,
  P1_T15_KEYWORD,
  P1_T15_PAGE_ID,
  P1_T15_PLATFORM_POST_ID,
  P1_T15_POST_CONTENT,
  P1_T15_PROFILE_ID,
  P1_T15_R08_JOURNAL_BRAND,
  P1_T15_ZERNIO_POST_ID,
  p1T15CreateBody,
  runP1T15R08ReadbackDiagnostic,
  type P1T15R08Journal,
  type P1T15Stage,
} from '../../src/provider-spike/p1-t15-runner.js';
import { runP1T15R03 } from '../../src/provider-spike/p1-t15-r03-runner.js';
import {
  FixedP1T15R08Journal,
  P1_T15_R08_EVIDENCE_PATH,
  P1_T15_R08_REQUEST_MAX,
  P1_T15_R08_TEST_EVIDENCE_PATH,
  parseP1T15R08Args,
  runP1T15R08,
} from '../../src/provider-spike/p1-t15-r08-runner.js';

const API='P1T15_R08_API_KEY_SENTINEL';
const EMAIL='p1-t15-r08@example.invalid';
const AUTO='auto-p1-t15-r08';
const R08_AUTH='P1_T15_R08_LIVE_AUTHORIZED';
const R03_AUTH='P1_T15_R03_LIVE_AUTHORIZED';
type Obj=Record<string,unknown>;
type Row={stage:P1T15Stage;[key:string]:unknown};
const rsp=(status:number,body:unknown,id:string):ProviderTransportResponse=>({status,headers:{'x-request-id':id},body});
const env=():NodeJS.ProcessEnv=>({ZERNIO_API_KEY:API,ZERNIO_EXPECTED_USER_EMAIL:EMAIL});
const neutralAudience=()=>({followerStatus:'any',minFollowerCount:0,whenUnknown:'send'});
const baseAutomation=():Obj=>({
  id:AUTO,name:P1_T15_AUTOMATION_NAME,platform:'facebook',trigger:'comment',accountId:P1_T15_ACCOUNT_ID,
  platformPostId:P1_T15_PLATFORM_POST_ID,postId:P1_T15_ZERNIO_POST_ID,profileId:P1_T15_PROFILE_ID,
  keywords:[P1_T15_KEYWORD],matchMode:'exact',dmMessage:P1_T15_DM_MESSAGE,buttons:[],template:null,
  alsoMatchInDms:false,dmDelaySeconds:0,audience:null,followGate:null,
});

async function withEnv<T>(name:string,value:string|undefined,action:()=>Promise<T>):Promise<T>{
  const previous=process.env[name];
  if(value===undefined)delete process.env[name];else process.env[name]=value;
  try{return await action();}finally{if(previous===undefined)delete process.env[name];else process.env[name]=previous;}
}
const withR08Auth=<T>(action:()=>Promise<T>)=>withEnv(R08_AUTH,'true',action);
const withoutR08Auth=<T>(action:()=>Promise<T>)=>withEnv(R08_AUTH,undefined,action);
const withoutR03Auth=<T>(action:()=>Promise<T>)=>withEnv(R03_AUTH,undefined,action);

interface MockOptions{
  createDelay?:'zero'|'missing';
  audience?:unknown;
  readbackAccount?:'exact'|'missing'|'wrong';
  createActive?:boolean;
  deleteStatus?:number;
  deleteRemovesDespiteFailure?:boolean;
  finalGetStatus?:number;
}
function mockProvider(options:MockOptions={}){
  const requests:ProviderTransportRequest[]=[];
  let exists=false;
  let active=false;
  let deleteAttempted=false;
  const post=()=>({_id:P1_T15_ZERNIO_POST_ID,content:P1_T15_POST_CONTENT,status:'published',platforms:[{platform:'facebook',accountId:P1_T15_ACCOUNT_ID,status:'published',platformPostId:P1_T15_PLATFORM_POST_ID,platformSpecificData:{pageId:P1_T15_PAGE_ID}}]});
  const transport:ProviderTransport={kind:'mock',send:vi.fn(async(request)=>{
    requests.push(request);
    const method=(request.method??'GET').toUpperCase(),path=(request.url??'').split('?')[0];
    if(method==='GET'&&path==='/v1/auth/verify')return rsp(200,{valid:true,email:EMAIL},'auth-r08');
    if(method==='GET'&&path==='/v1/accounts')return rsp(200,{accounts:[{_id:P1_T15_ACCOUNT_ID,profileId:P1_T15_PROFILE_ID,platform:'facebook'}]},'accounts-r08');
    if(method==='GET'&&path===`/v1/posts/${P1_T15_ZERNIO_POST_ID}`)return rsp(200,post(),'post-r08');
    if(method==='POST'&&path==='/v1/comment-automations'){
      exists=true;active=options.createActive===true;
      const created:Obj={...baseAutomation(),isActive:active};
      if(options.createDelay==='missing')delete created.dmDelaySeconds;
      return rsp(200,{success:true,automation:created},'create-r08');
    }
    if(method==='GET'&&path===`/v1/comment-automations/${AUTO}`){
      if(deleteAttempted&&options.finalGetStatus!==undefined)return rsp(options.finalGetStatus,{error:'synthetic final read-back'},'final-r08');
      if(!exists)return rsp(404,{error:'Not found'},'absent-r08');
      const current:Obj={...baseAutomation(),isActive:active,stats:{totalTriggered:0,totalSent:0},logs:[]};
      delete current.profileId;
      delete current.dmDelaySeconds;
      current.audience=options.audience??neutralAudience();
      if(options.readbackAccount==='missing')delete current.accountId;
      if(options.readbackAccount==='wrong')current.accountId='wrong-account';
      return rsp(200,{success:true,automation:current},'readback-r08');
    }
    if(method==='DELETE'&&path===`/v1/comment-automations/${AUTO}`){
      deleteAttempted=true;
      const status=options.deleteStatus??200;
      if((status>=200&&status<300)||options.deleteRemovesDespiteFailure)exists=false;
      return rsp(status,status>=200&&status<300?{success:true}:{error:'delete failed'},'delete-r08');
    }
    throw new Error(`UNEXPECTED_R08_MOCK_REQUEST:${method}:${path}`);
  })};
  return{transport,requests};
}

async function runAuthorized(options:MockOptions={},maxRequests?:number){
  const mock=mockProvider(options);
  const result=await withR08Auth(()=>runP1T15R08({live:true,env:env(),transport:mock.transport,...(maxRequests===undefined?{}:{maxRequests})}));
  return{...mock,result};
}
async function rows():Promise<Row[]>{const text=await readFile(P1_T15_R08_EVIDENCE_PATH,'utf8');return text.trim().split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line) as Row);}
function paths(requests:ProviderTransportRequest[]){return requests.map(r=>`${(r.method??'GET').toUpperCase()} ${(r.url??'').split('?')[0]}`);}

class FakeR08Journal implements P1T15R08Journal{
  readonly [P1_T15_R08_JOURNAL_BRAND]='fixed' as const;
  async initialize(_forbidden:string[]){}
  async append(_stage:P1T15Stage,_fields:Obj,_forbidden:string[]){}
}

afterEach(async()=>{
  delete process.env[R08_AUTH];
  delete process.env[R03_AUTH];
  await rm(P1_T15_R08_EVIDENCE_PATH,{force:true});
});

describe('P1-T15-R08 dedicated reconciled live-diagnostic lane',()=>{
  it('R08-01 has exact fixed live/test paths, request ceiling, and CLI surface',()=>{
    expect(P1_T15_R08_EVIDENCE_PATH).toBe(R08_LIVE_PATH);
    expect(P1_T15_R08_TEST_EVIDENCE_PATH).toBe(R08_TEST_PATH);
    expect(P1_T15_R08_REQUEST_MAX).toBe(9);
    expect(parseP1T15R08Args([])).toEqual({ok:true,live:false});
    expect(parseP1T15R08Args(['--live'])).toEqual({ok:true,live:true});
    for(const args of [['--live','x'],['--profile','x'],['--evidence-path','x'],['--url','x']])expect(parseP1T15R08Args(args).ok).toBe(false);
  });

  it('R08-02 defaults offline with zero transport',async()=>{
    const mock=mockProvider();
    const result=await runP1T15R08({env:env(),transport:mock.transport});
    expect(result).toMatchObject({liveEnabled:false,result:'BLOCKED',errorCategory:'LIVE_OPT_IN_REQUIRED'});
    expect(mock.requests).toHaveLength(0);
  });

  it('R08-03 real process R08 authorization is required before transport',async()=>{
    const mock=mockProvider();
    const result=await withoutR08Auth(()=>runP1T15R08({live:true,env:env(),transport:mock.transport}));
    expect(result).toMatchObject({result:'BLOCKED',errorCategory:'R08_LIVE_AUTHORIZATION_REQUIRED'});
    expect(mock.requests).toHaveLength(0);
  });

  it('R08-04 caller boolean and injected env cannot grant authorization',async()=>{
    const a=mockProvider();
    const caller=await withoutR08Auth(()=>runP1T15R08({live:true,liveAuthorized:true,env:env(),transport:a.transport}));
    expect(caller.errorCategory).toBe('R08_LIVE_AUTHORIZATION_REQUIRED');expect(a.requests).toHaveLength(0);
    const b=mockProvider();
    const injected=await withoutR08Auth(()=>runP1T15R08({live:true,env:{...env(),P1_T15_R08_LIVE_AUTHORIZED:'true'},transport:b.transport}));
    expect(injected.errorCategory).toBe('R08_LIVE_AUTHORIZATION_REQUIRED');expect(b.requests).toHaveLength(0);
  });

  it('R08-05 R03 authorization cannot authorize R08 and R08 authorization cannot authorize R03',async()=>{
    const a=mockProvider();
    const r08=await withoutR08Auth(()=>withEnv(R03_AUTH,'true',()=>runP1T15R08({live:true,env:env(),transport:a.transport})));
    expect(r08.errorCategory).toBe('R08_LIVE_AUTHORIZATION_REQUIRED');expect(a.requests).toHaveLength(0);
    const b=mockProvider();
    const r03=await withoutR03Auth(()=>withR08Auth(()=>runP1T15R03({live:true,env:env(),transport:b.transport})));
    expect(r03.errorCategory).toBe('R03_LIVE_AUTHORIZATION_REQUIRED');expect(b.requests).toHaveLength(0);
  });

  it('R08-06 arbitrary journal cannot impersonate trusted R08 journal',async()=>{
    const mock=mockProvider();
    const result=await withR08Auth(()=>runP1T15R08({live:true,env:env(),transport:mock.transport,journal:new FakeR08Journal()}));
    expect(result.errorCategory).toBe('SAFETY_R08_JOURNAL_SCOPE_INVALID');expect(mock.requests).toHaveLength(0);
  });

  it('R08-07 direct core path is process-bound and requires the genuine R08 journal',async()=>{
    const a=mockProvider();
    const blocked=await withoutR08Auth(()=>runP1T15R08ReadbackDiagnostic({live:true,env:{...env(),P1_T15_R08_LIVE_AUTHORIZED:'true'},transport:a.transport,journal:new FixedP1T15R08Journal()}));
    expect(blocked.errorCategory).toBe('R08_LIVE_AUTHORIZATION_REQUIRED');expect(a.requests).toHaveLength(0);
    const b=mockProvider();
    const spoofed=await withR08Auth(()=>runP1T15R08ReadbackDiagnostic({live:true,env:env(),transport:b.transport,journal:new FakeR08Journal()}));
    expect(spoofed.errorCategory).toBe('SAFETY_R08_JOURNAL_SCOPE_INVALID');expect(b.requests).toHaveLength(0);
  });

  it('R08-08 request budget below cleanup-safe minimum fails before transport',async()=>{
    const mock=mockProvider();
    const result=await withR08Auth(()=>runP1T15R08({live:true,env:env(),transport:mock.transport,maxRequests:6}));
    expect(result.errorCategory).toBe('R08_REQUEST_BUDGET_INSUFFICIENT_FOR_CLEANUP_RESERVATION');expect(mock.requests).toHaveLength(0);
  });

  it('R08-09 filesystem initialization/append/read/remove physically resolve only to R08 test path',async()=>{
    await rm(P1_T15_R08_EVIDENCE_PATH,{force:true});fsAudit.length=0;
    const journal=new FixedP1T15R08Journal();
    await journal.initialize([API,EMAIL]);
    await journal.append('RUN_STARTED',{requestMax:7},[API,EMAIL]);
    expect(await readFile(P1_T15_R08_EVIDENCE_PATH,'utf8')).toContain('RUN_STARTED');
    await rm(P1_T15_R08_EVIDENCE_PATH,{force:true});
    const relevant=fsAudit.filter(e=>e.requestedPath===R08_LIVE_PATH);
    expect(relevant).toEqual([
      {operation:'open',requestedPath:R08_LIVE_PATH,effectivePath:R08_TEST_PATH,flags:'wx'},
      {operation:'open',requestedPath:R08_LIVE_PATH,effectivePath:R08_TEST_PATH,flags:'a'},
      {operation:'readFile',requestedPath:R08_LIVE_PATH,effectivePath:R08_TEST_PATH},
      {operation:'rm',requestedPath:R08_LIVE_PATH,effectivePath:R08_TEST_PATH},
    ]);
    expect(fsAudit.some(e=>e.effectivePath===R08_LIVE_PATH)).toBe(false);
    expect(fsAudit.some(e=>e.requestedPath===R03_HISTORICAL_PATH||e.effectivePath===R03_HISTORICAL_PATH)).toBe(false);
    await expect(readFile(P1_T15_R08_EVIDENCE_PATH,'utf8')).rejects.toMatchObject({code:'ENOENT'});
  });

  it('R08-10 pre-existing R08 evidence fails closed before Provider transport',async()=>{
    await rm(P1_T15_R08_EVIDENCE_PATH,{force:true});
    const handle=await open(P1_T15_R08_EVIDENCE_PATH,'wx');await handle.close();
    const mock=mockProvider();
    const result=await withR08Auth(()=>runP1T15R08({live:true,env:env(),transport:mock.transport}));
    expect(result).toMatchObject({result:'FAIL',errorCategory:'SAFETY_EVIDENCE_FILE_ALREADY_EXISTS'});
    expect(mock.requests).toHaveLength(0);
  });

  it('R08-11 trusted R08 journal rejects secrets and forbidden PII before persistence',async()=>{
    await rm(P1_T15_R08_EVIDENCE_PATH,{force:true});
    const journal=new FixedP1T15R08Journal();
    await journal.initialize([API,EMAIL]);
    await expect(journal.append('RUN_STARTED',{unsafe:API},[API,EMAIL])).rejects.toThrow('SAFETY_EVIDENCE_SECRET_OR_PII_LEAK_PREVENTED');
    await expect(journal.append('RUN_STARTED',{unsafe:EMAIL},[API,EMAIL])).rejects.toThrow('SAFETY_EVIDENCE_SECRET_OR_PII_LEAK_PREVENTED');
    expect(await readFile(P1_T15_R08_EVIDENCE_PATH,'utf8')).toBe('');
  });

  it('R08-A accepts R06-shaped reconciled config only after exact cleanup',async()=>{
    await rm(P1_T15_R08_EVIDENCE_PATH,{force:true});fsAudit.length=0;
    const {result,requests}=await runAuthorized();
    expect(result).toMatchObject({result:'PASS',classification:'COMMENT_AUTOMATION_READBACK_DIAGNOSTIC_COMPLETED',cleanup:'CLEANUP_VERIFIED'});
    expect(result.counters).toMatchObject({providerRequests:7,creates:1,enablePatches:0,disablePatches:0,deletes:1,retries:0});
    expect(paths(requests)).toEqual([
      'GET /v1/auth/verify','GET /v1/accounts',`GET /v1/posts/${P1_T15_ZERNIO_POST_ID}`,'POST /v1/comment-automations',
      `GET /v1/comment-automations/${AUTO}`,`DELETE /v1/comment-automations/${AUTO}`,`GET /v1/comment-automations/${AUTO}`,
    ]);
    expect(requests.find(r=>r.method==='POST')?.body).toEqual(p1T15CreateBody());
    expect(requests.some(r=>r.method==='PATCH')).toBe(false);
    const evidence=await rows();
    expect(evidence.map(r=>r.stage)).toEqual(['RUN_STARTED','IDENTITY_VERIFIED','TARGET_VERIFIED','CREATE_ATTEMPT_COMPLETED','READBACK_DIAGNOSTIC_CAPTURED','CREATED_DISABLED_VERIFIED','CLEANUP_COMPLETED','RUN_FINALIZED']);
    const diag=evidence.find(r=>r.stage==='READBACK_DIAGNOSTIC_CAPTURED')?.diagnostic as {fields:Array<{path:string;verificationSource:string}>};
    const source=(path:string)=>diag.fields.find(f=>f.path===path)?.verificationSource;
    expect(source('profileId')).toBe('ACCOUNT_OWNERSHIP_PREFLIGHT');
    expect(source('dmDelaySeconds')).toBe('CREATE_RESPONSE');
    expect(source('audience')).toBe('PROVIDER_DEFAULT_NORMALIZATION');
    const serialized=JSON.stringify(evidence);
    expect(serialized).not.toContain('followerStatus');expect(serialized).not.toContain(API);expect(serialized).not.toContain(EMAIL);
    expect(fsAudit.some(e=>e.effectivePath===R08_LIVE_PATH||e.requestedPath===R03_HISTORICAL_PATH||e.effectivePath===R03_HISTORICAL_PATH)).toBe(false);
  });

  it('R08-B missing create delay proof fails closed and still cleans exactly',async()=>{
    await rm(P1_T15_R08_EVIDENCE_PATH,{force:true});
    const {result,requests}=await runAuthorized({createDelay:'missing'});
    expect(result).toMatchObject({result:'FAIL',errorCategory:'SAFETY_DISABLED_READBACK_CONFIG_MISMATCH',cleanup:'CLEANUP_VERIFIED'});
    expect(paths(requests).slice(-2)).toEqual([`DELETE /v1/comment-automations/${AUTO}`,`GET /v1/comment-automations/${AUTO}`]);
    expect(requests.some(r=>r.method==='PATCH')).toBe(false);
  });

  it('R08-C unsafe audience fails closed and still cleans exactly',async()=>{
    await rm(P1_T15_R08_EVIDENCE_PATH,{force:true});
    const {result,requests}=await runAuthorized({audience:{followerStatus:'follower',minFollowerCount:0,whenUnknown:'send'}});
    expect(result).toMatchObject({result:'FAIL',errorCategory:'SAFETY_DISABLED_READBACK_CONFIG_MISMATCH',cleanup:'CLEANUP_VERIFIED'});
    expect(requests.filter(r=>r.method==='DELETE')).toHaveLength(1);expect(requests.some(r=>r.method==='PATCH')).toBe(false);
  });

  it('R08-D insufficient ownership evidence at read-back fails closed and cleans exactly',async()=>{
    await rm(P1_T15_R08_EVIDENCE_PATH,{force:true});
    const {result,requests}=await runAuthorized({readbackAccount:'missing'});
    expect(result).toMatchObject({result:'FAIL',errorCategory:'SAFETY_DISABLED_READBACK_CONFIG_MISMATCH',cleanup:'CLEANUP_VERIFIED'});
    expect(requests.filter(r=>r.method==='DELETE')).toHaveLength(1);expect(requests.some(r=>r.method==='PATCH')).toBe(false);
  });

  it('R08-E Provider active create is safety failure with immediate DELETE/final GET and never PATCH',async()=>{
    await rm(P1_T15_R08_EVIDENCE_PATH,{force:true});
    const {result,requests}=await runAuthorized({createActive:true});
    expect(result).toMatchObject({result:'FAIL',errorCategory:'R08_CREATE_RESPONSE_ACTIVE',cleanup:'CLEANUP_VERIFIED'});
    expect(paths(requests)).toEqual(['GET /v1/auth/verify','GET /v1/accounts',`GET /v1/posts/${P1_T15_ZERNIO_POST_ID}`,'POST /v1/comment-automations',`DELETE /v1/comment-automations/${AUTO}`,`GET /v1/comment-automations/${AUTO}`]);
    expect(requests.some(r=>r.method==='PATCH')).toBe(false);
  });

  it('R08-F failed DELETE plus final 404 remains cleanup-unsafe and never PASS',async()=>{
    await rm(P1_T15_R08_EVIDENCE_PATH,{force:true});
    const {result,requests}=await runAuthorized({deleteStatus:500,deleteRemovesDespiteFailure:true});
    expect(result).toMatchObject({result:'FAIL',errorCategory:'R08_CLEANUP_DELETE_FAILED',cleanup:'CLEANUP_UNSAFE_OR_UNKNOWN'});
    expect(requests.filter(r=>r.method==='DELETE')).toHaveLength(1);
    expect(requests.filter(r=>(r.method??'GET').toUpperCase()==='GET'&&(r.url??'').split('?')[0]===`/v1/comment-automations/${AUTO}`)).toHaveLength(2);
    expect(requests.some(r=>r.method==='PATCH')).toBe(false);
  });
});
