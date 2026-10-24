import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFile, rm } from 'node:fs/promises';
import type { ProviderTransport, ProviderTransportRequest, ProviderTransportResponse } from '../../src/provider-spike/types.js';
import {
  diagnoseP1T15ExactConfig,
  P1_T15_ACCOUNT_ID,
  P1_T15_AUTOMATION_NAME,
  P1_T15_DM_MESSAGE,
  P1_T15_KEYWORD,
  P1_T15_PAGE_ID,
  P1_T15_PLATFORM_POST_ID,
  P1_T15_POST_CONTENT,
  P1_T15_POST_SHA256,
  P1_T15_PROFILE_ID,
  P1_T15_ZERNIO_POST_ID,
  p1T15CreateBody,
} from '../../src/provider-spike/p1-t15-runner.js';
import { FixedP1T15R03Journal, P1_T15_R03_EVIDENCE_PATH, runP1T15R03 } from '../../src/provider-spike/p1-t15-r03-runner.js';
import type { P1T15Journal, P1T15Stage } from '../../src/provider-spike/p1-t15-runner.js';

const API='P1T15_R03_API_KEY_SENTINEL';
const EMAIL='p1-t15-r03@example.invalid';
const AUTO='auto-p1-t15-r03';
type Obj=Record<string,unknown>;
type JournalRow={stage:P1T15Stage;[key:string]:unknown};
class MemoryJournal implements P1T15Journal {
  rows:JournalRow[]=[];
  initialized=false;
  async initialize(_forbidden:string[]){this.initialized=true;}
  async append(stage:P1T15Stage,fields:Obj,_forbidden:string[]){this.rows.push({stage,...fields});}
}
const baseAutomation=():Obj=>({
  id:AUTO,
  name:P1_T15_AUTOMATION_NAME,
  platform:'facebook',
  trigger:'comment',
  accountId:P1_T15_ACCOUNT_ID,
  platformPostId:P1_T15_PLATFORM_POST_ID,
  postId:P1_T15_ZERNIO_POST_ID,
  profileId:P1_T15_PROFILE_ID,
  keywords:[P1_T15_KEYWORD],
  matchMode:'exact',
  dmMessage:P1_T15_DM_MESSAGE,
  buttons:[],
  template:null,
  alsoMatchInDms:false,
  dmDelaySeconds:0,
  audience:null,
  followGate:null,
});
const diag=(a:Obj|null=baseAutomation())=>diagnoseP1T15ExactConfig(a,AUTO);
const field=(a:ReturnType<typeof diag>,path:string)=>a.fields.find(item=>item.path===path)!;
const refText=(value:unknown)=>typeof value==='string'&&value.length?value:null;
const refNum=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)?value:null;
const refObj=(value:unknown):Obj|null=>typeof value==='object'&&value!==null&&!Array.isArray(value)?value as Obj:null;
const refValueId=(value:unknown):string|null=>{if(typeof value==='string'&&value)return value;const object=refObj(value);return object?refText(object._id)??refText(object.id)??refText(object.accountId):null;};
function referenceExactConfig(a:Obj|null,id:string):boolean{
  if(!a)return false;
  const automationId=refText(a.id)??refText(a._id);
  if(automationId&&automationId!==id)return false;
  if(refText(a.name)!==P1_T15_AUTOMATION_NAME||refText(a.trigger)!=='comment'||refText(a.accountId)!==P1_T15_ACCOUNT_ID||refText(a.platformPostId)!==P1_T15_PLATFORM_POST_ID||refText(a.postId)!==P1_T15_ZERNIO_POST_ID)return false;
  if(a.profileId!==undefined&&refValueId(a.profileId)!==P1_T15_PROFILE_ID)return false;
  if(a.platform!==undefined&&refText(a.platform)!=='facebook')return false;
  const keywords=Array.isArray(a.keywords)?a.keywords:[];
  if(keywords.length!==1||keywords[0]!==P1_T15_KEYWORD||refText(a.matchMode)!=='exact'||refText(a.dmMessage)!==P1_T15_DM_MESSAGE||a.alsoMatchInDms!==false||refNum(a.dmDelaySeconds)!==0)return false;
  if(Array.isArray(a.buttons)&&a.buttons.length!==0)return false;
  if(typeof a.commentReply==='string'&&a.commentReply.length>0)return false;
  if(a.template!==undefined&&a.template!==null)return false;
  if(a.audience!==undefined&&a.audience!==null)return false;
  if(a.followGate!==undefined&&a.followGate!==null)return false;
  return true;
}
const rsp=(status:number,body:unknown,id:string):ProviderTransportResponse=>({status,headers:{'x-request-id':id},body});
const env=():NodeJS.ProcessEnv=>({ZERNIO_API_KEY:API,ZERNIO_EXPECTED_USER_EMAIL:EMAIL});

type MockOptions={createActive?:boolean;createWithoutId?:boolean;readbackActiveAfterCreate?:boolean;missingTriggerEvidence?:boolean;readbackMismatch?:string|null;deleteStatus?:number;deleteRemovesDespiteFailure?:boolean;finalGetStatus?:number};
function mockProvider(options:MockOptions={}){
  const requests:ProviderTransportRequest[]=[];
  let exists=false;
  let active=false;
  let deleteAttempted=false;
  let automation=baseAutomation();
  const postBody=()=>({_id:P1_T15_ZERNIO_POST_ID,content:P1_T15_POST_CONTENT,status:'published',platforms:[{platform:'facebook',accountId:P1_T15_ACCOUNT_ID,status:'published',platformPostId:P1_T15_PLATFORM_POST_ID,platformSpecificData:{pageId:P1_T15_PAGE_ID}}]});
  const transport:ProviderTransport={kind:'mock',send:vi.fn(async(request)=>{
    requests.push(request);
    const method=(request.method??'GET').toUpperCase();
    const url=request.url??'';
    const path=url.split('?')[0];
    if(method==='GET'&&path==='/v1/auth/verify')return rsp(200,{valid:true,email:EMAIL},'auth-r03');
    if(method==='GET'&&path==='/v1/accounts')return rsp(200,{accounts:[{_id:P1_T15_ACCOUNT_ID,profileId:P1_T15_PROFILE_ID,platform:'facebook'}]},'accounts-r03');
    if(method==='GET'&&path===`/v1/posts/${P1_T15_ZERNIO_POST_ID}`)return rsp(200,postBody(),'post-r03');
    if(method==='POST'&&path==='/v1/comment-automations'){
      exists=true;
      active=options.createActive===true;
      automation={...baseAutomation(),isActive:active};
      const created:Obj={...automation};
      if(options.createWithoutId)delete created.id;
      return rsp(200,{success:true,automation:created},'create-r03');
    }
    if(method==='GET'&&path===`/v1/comment-automations/${AUTO}`){
      if(deleteAttempted&&options.finalGetStatus!==undefined)return rsp(options.finalGetStatus,{error:'synthetic final read-back unavailable'},'final-get-r03');
      if(!exists)return rsp(404,{error:'Not found'},'absent-r03');
      const detailReadCount=requests.filter(x=>x.method==='GET'&&x.url===`/v1/comment-automations/${AUTO}`).length;
      const current:Obj={...automation,isActive:options.readbackActiveAfterCreate&&detailReadCount===1?true:active,stats:{totalTriggered:0,totalSent:0,totalFailed:0},logs:[]};
      if(options.missingTriggerEvidence){delete current.stats;delete current.logs;}
      if(!options.createActive&&options.readbackMismatch&&detailReadCount===1){
        current[options.readbackMismatch]='R03_SYNTHETIC_MISMATCH_SENTINEL';
      }
      return rsp(200,{success:true,automation:current},'readback-r03');
    }
    if(method==='PATCH'&&path===`/v1/comment-automations/${AUTO}`){
      const body=request.body as Obj;
      active=body.isActive===true;
      automation={...automation,isActive:active};
      return rsp(200,{success:true,automation},'patch-r03');
    }
    if(method==='DELETE'&&path===`/v1/comment-automations/${AUTO}`){
      deleteAttempted=true;
      const status=options.deleteStatus??200;
      if((status>=200&&status<300)||options.deleteRemovesDespiteFailure)exists=false;
      return rsp(status,status===200?{success:true}:{error:'delete failed'},'delete-r03');
    }
    throw new Error(`UNEXPECTED_MOCK_REQUEST:${method}:${path}`);
  })};
  return {transport,requests,get exists(){return exists;}};
}

afterEach(async()=>{await rm(P1_T15_R03_EVIDENCE_PATH,{force:true});});

describe('P1-T15-R03 exact automation read-back diagnostic',()=>{
  it('R03-01 valid configuration produces deterministic, bounded, value-free output',()=>{
    const a=baseAutomation();
    const first=diagnoseP1T15ExactConfig(a,AUTO);
    const second=diagnoseP1T15ExactConfig(a,AUTO);
    expect(first).toEqual(second);
    expect(first.accepted).toBe(true);
    expect(first.mismatchCount).toBe(0);
    expect(first.fields.map(x=>x.path)).toEqual(['id','_id','identity','name','trigger','accountId','platformPostId','postId','profileId','platform','keywords','matchMode','dmMessage','alsoMatchInDms','dmDelaySeconds','buttons','commentReply','template','audience','followGate']);
    const serialized=JSON.stringify(first);
    for(const secret of [API,EMAIL,P1_T15_ACCOUNT_ID,P1_T15_PROFILE_ID,P1_T15_ZERNIO_POST_ID,P1_T15_PLATFORM_POST_ID,P1_T15_AUTOMATION_NAME,P1_T15_DM_MESSAGE,P1_T15_KEYWORD])expect(serialized).not.toContain(secret);
  });

  it('R03-01a projection preserves every accepted/rejected outcome of the pre-R03 exactConfig predicate',()=>{
    const variants:Record<string,unknown[]>={
      id:[undefined,null,17,'',AUTO,'wrong',{_id:AUTO}],_id:[undefined,null,17,'',AUTO,'wrong',{_id:AUTO}],
      name:[undefined,null,17,'',P1_T15_AUTOMATION_NAME,'wrong'],trigger:[undefined,null,false,'','comment','story_reply'],
      accountId:[undefined,null,17,'',P1_T15_ACCOUNT_ID,{_id:P1_T15_ACCOUNT_ID}],platformPostId:[undefined,null,17,'',P1_T15_PLATFORM_POST_ID],
      postId:[undefined,null,17,'',P1_T15_ZERNIO_POST_ID],profileId:[undefined,null,17,'',P1_T15_PROFILE_ID,{_id:P1_T15_PROFILE_ID},{metadata:{_id:P1_T15_PROFILE_ID}}],
      platform:[undefined,null,17,'','facebook','instagram'],keywords:[undefined,null,17,[],[P1_T15_KEYWORD],[P1_T15_KEYWORD,'extra']],
      matchMode:[undefined,null,17,'','exact','contains'],dmMessage:[undefined,null,17,'',P1_T15_DM_MESSAGE,'wrong'],
      alsoMatchInDms:[undefined,null,17,false,true],dmDelaySeconds:[undefined,null,'0',0,1],buttons:[undefined,null,17,[],[{}]],
      commentReply:[undefined,null,17,'','reply'],template:[undefined,null,false,{},'value'],audience:[undefined,null,false,{},'value'],followGate:[undefined,null,false,{},'value'],
    };
    for(const [key,values] of Object.entries(variants))for(const value of values){
      const candidate={...baseAutomation()};
      if(value===undefined)delete candidate[key];else candidate[key]=value;
      expect(diag(candidate).accepted, `${key}=${String(value)}`).toBe(referenceExactConfig(candidate,AUTO));
    }
  });

  it('R03-02 missing, null, wrong type, empty, and value mismatch are distinguished for required strings',()=>{
    const missing=baseAutomation(); delete missing.name;
    const explicitNull={...baseAutomation(),name:null};
    const wrongType={...baseAutomation(),name:17};
    const empty={...baseAutomation(),name:''};
    const mismatch={...baseAutomation(),name:'different'};
    expect(field(diag(missing),'name')).toMatchObject({fieldState:'missing',jsonType:'missing',accepted:false,mismatchCategory:'MISSING_REQUIRED_FIELD'});
    expect(field(diag(explicitNull),'name')).toMatchObject({fieldState:'null',jsonType:'null',accepted:false,mismatchCategory:'NULL_REQUIRED_FIELD'});
    expect(field(diag(wrongType),'name')).toMatchObject({fieldState:'wrong_type',jsonType:'number',accepted:false,mismatchCategory:'WRONG_TYPE'});
    expect(field(diag(empty),'name')).toMatchObject({fieldState:'present',jsonType:'string',accepted:false,mismatchCategory:'EMPTY_STRING'});
    expect(field(diag(mismatch),'name')).toMatchObject({fieldState:'present',accepted:false,mismatchCategory:'VALUE_MISMATCH'});
  });

  it('R03-02a required arrays and optional scalar fields distinguish missing, null, wrong type, and mismatch',()=>{
    const missingKeywords=baseAutomation(); delete missingKeywords.keywords;
    expect(field(diag(missingKeywords),'keywords')).toMatchObject({fieldState:'missing',accepted:false,mismatchCategory:'MISSING_REQUIRED_FIELD'});
    expect(field(diag({...baseAutomation(),keywords:null}),'keywords')).toMatchObject({fieldState:'null',accepted:false,mismatchCategory:'NULL_REQUIRED_FIELD'});
    expect(field(diag({...baseAutomation(),keywords:'not-an-array'}),'keywords')).toMatchObject({fieldState:'wrong_type',accepted:false,mismatchCategory:'WRONG_TYPE'});
    expect(field(diag({...baseAutomation(),platform:17}),'platform')).toMatchObject({fieldState:'wrong_type',accepted:false,mismatchCategory:'WRONG_TYPE'});
    expect(field(diag({...baseAutomation(),platform:'instagram'}),'platform')).toMatchObject({fieldState:'present',accepted:false,mismatchCategory:'VALUE_MISMATCH'});
    expect(field(diag({...baseAutomation(),profileId:17}),'profileId')).toMatchObject({fieldState:'wrong_type',accepted:false,mismatchCategory:'WRONG_TYPE'});
    expect(field(diag({...baseAutomation(),alsoMatchInDms:null}),'alsoMatchInDms')).toMatchObject({fieldState:'null',accepted:false,mismatchCategory:'NULL_REQUIRED_FIELD'});
    expect(field(diag({...baseAutomation(),dmDelaySeconds:'0'}),'dmDelaySeconds')).toMatchObject({fieldState:'wrong_type',accepted:false,mismatchCategory:'WRONG_TYPE'});
  });

  it('R03-03 every required predicate rejects a synthetic mismatch',()=>{
    const cases:Array<[string,Obj]>=[
      ['name',{name:'wrong'}],['trigger',{trigger:'dm'}],['accountId',{accountId:{_id:P1_T15_ACCOUNT_ID}}],
      ['platformPostId',{platformPostId:'wrong'}],['postId',{postId:'wrong'}],['keywords',{keywords:[P1_T15_KEYWORD,'extra']}],
      ['matchMode',{matchMode:'contains'}],['dmMessage',{dmMessage:'not the fixed message'}],
      ['alsoMatchInDms',{alsoMatchInDms:'false'}],['dmDelaySeconds',{dmDelaySeconds:'0'}],
    ];
    for(const [path,override] of cases){
      const result=diag({...baseAutomation(),...override});
      expect(result.accepted, path).toBe(false);
      expect(field(result,path).accepted,path).toBe(false);
    }
  });

  it('R03-04 profileId supports only the existing bounded valueId fields and exact expected value',()=>{
    for(const profileId of [P1_T15_PROFILE_ID,{_id:P1_T15_PROFILE_ID},{id:P1_T15_PROFILE_ID},{accountId:P1_T15_PROFILE_ID}]){
      const result=diag({...baseAutomation(),profileId});
      expect(field(result,'profileId').accepted).toBe(true);
    }
    const unrelated=diag({...baseAutomation(),profileId:{metadata:{_id:P1_T15_PROFILE_ID}}});
    expect(field(unrelated,'profileId')).toMatchObject({fieldState:'present',accepted:false,mismatchCategory:'UNRESOLVED_IDENTIFIER',valueSource:'unresolved_object'});
    expect(diag({...baseAutomation(),profileId:{_id:'wrong',metadata:{_id:P1_T15_PROFILE_ID}}}).accepted).toBe(false);
    expect(field(diag({...baseAutomation(),profileId:null}),'profileId')).toMatchObject({fieldState:'null',accepted:false,mismatchCategory:'NULL_IDENTIFIER'});
    const missing=baseAutomation(); delete missing.profileId;
    expect(field(diag(missing),'profileId')).toMatchObject({fieldState:'missing',accepted:true,valueSource:'absent'});
  });

  it('R03-05 optional identifier and platform predicates preserve current validator semantics',()=>{
    const missingIds=baseAutomation(); delete missingIds.id;
    expect(field(diag(missingIds),'identity')).toMatchObject({fieldState:'missing',accepted:true,valueSource:'none'});
    const objectId=diag({...baseAutomation(),id:{_id:AUTO}});
    expect(field(objectId,'id')).toMatchObject({fieldState:'wrong_type',accepted:null,evaluated:false});
    expect(field(objectId,'identity')).toMatchObject({fieldState:'missing',accepted:true,valueSource:'none'});
    const wrongId=diag({...baseAutomation(),id:'wrong',_id:AUTO});
    expect(wrongId.accepted).toBe(false);
    expect(wrongId.mismatchCount).toBe(1);
    expect(field(wrongId,'identity')).toMatchObject({accepted:false,mismatchCategory:'IDENTIFIER_MISMATCH',valueSource:'id'});
    expect(diag({...baseAutomation(),id:{_id:'wrong'},_id:AUTO}).accepted).toBe(true);
    const missingPlatform=baseAutomation(); delete missingPlatform.platform;
    expect(field(diag(missingPlatform),'platform')).toMatchObject({fieldState:'missing',accepted:true});
    expect(field(diag({...baseAutomation(),platform:null}),'platform')).toMatchObject({fieldState:'null',accepted:false,mismatchCategory:'NULL_REQUIRED_FIELD'});
    expect(field(diag({...baseAutomation(),accountId:{_id:P1_T15_ACCOUNT_ID}}),'accountId')).toMatchObject({fieldState:'wrong_type',accepted:false,mismatchCategory:'WRONG_TYPE'});
  });

  it('R03-06 optional buttons/commentReply and absent-versus-null constraints mirror exactConfig',()=>{
    for(const value of [undefined,null,'not-an-array',7]){
      const a=baseAutomation(); if(value===undefined)delete a.buttons; else a.buttons=value;
      expect(field(diag(a),'buttons').accepted).toBe(true);
    }
    expect(field(diag({...baseAutomation(),buttons:[{}]}),'buttons')).toMatchObject({accepted:false,mismatchCategory:'UNEXPECTED_NON_EMPTY_ARRAY'});
    for(const value of [undefined,null,7,{},'']){
      const a=baseAutomation(); if(value===undefined)delete a.commentReply; else a.commentReply=value;
      expect(field(diag(a),'commentReply').accepted).toBe(true);
    }
    expect(field(diag({...baseAutomation(),commentReply:'public reply'}),'commentReply')).toMatchObject({accepted:false,mismatchCategory:'UNEXPECTED_NON_EMPTY_STRING'});
    for(const path of ['template','audience','followGate']){
      const missing=baseAutomation(); delete missing[path];
      expect(field(diag(missing),path).accepted).toBe(true);
      expect(field(diag({...baseAutomation(),[path]:null}),path).accepted).toBe(true);
      expect(field(diag({...baseAutomation(),[path]:false}),path)).toMatchObject({accepted:false,mismatchCategory:'UNEXPECTED_NON_NULL_VALUE'});
    }
  });

  it('R03-07 reports multiple independent mismatches without values or recursive identifier search',()=>{
    const a={...baseAutomation(),name:'secret name sentinel',accountId:{metadata:{accountId:P1_T15_ACCOUNT_ID}},keywords:[],dmMessage:'private message sentinel',commenterName:'private person',commentText:'private comment'};
    const result=diag(a);
    expect(result.accepted).toBe(false);
    expect(result.mismatchCount).toBe(4);
    expect(field(result,'name').mismatchCategory).toBe('VALUE_MISMATCH');
    expect(field(result,'accountId').mismatchCategory).toBe('WRONG_TYPE');
    expect(field(result,'keywords').mismatchCategory).toBe('ARRAY_LENGTH_MISMATCH');
    expect(field(result,'dmMessage').mismatchCategory).toBe('VALUE_MISMATCH');
    const serialized=JSON.stringify(result);
    for(const value of ['secret name sentinel','private message sentinel','private person','private comment',P1_T15_ACCOUNT_ID])expect(serialized).not.toContain(value);
  });

  it('R03-08 null/non-object automation envelope fails closed with one safe diagnostic',()=>{
    expect(diagnoseP1T15ExactConfig(null,AUTO)).toEqual({accepted:false,mismatchCount:1,fields:[{path:'automation',requiredness:'required',fieldState:'missing',jsonType:'missing',evaluated:true,accepted:false,mismatchCategory:'AUTOMATION_ENVELOPE_MISSING'}]});
  });

  it('R03-09a default mode stays offline and makes zero transport calls',async()=>{
    const provider=mockProvider();
    const result=await runP1T15R03({env:{},transport:provider.transport,journal:new MemoryJournal()});
    expect(result.errorCategory).toBe('LIVE_OPT_IN_REQUIRED');
    expect(result.counters.providerRequests).toBe(0);
    expect(provider.requests).toHaveLength(0);
  });

  it('R03-09 live mode is blocked before transport without explicit R03 authorization',async()=>{
    const provider=mockProvider();
    const journal=new MemoryJournal();
    const result=await runP1T15R03({live:true,liveAuthorized:false,env:env(),transport:provider.transport,journal});
    expect(result.result).toBe('BLOCKED');
    expect(result.errorCategory).toBe('R03_LIVE_AUTHORIZATION_REQUIRED');
    expect(result.counters.providerRequests).toBe(0);
    expect(provider.requests).toHaveLength(0);
    expect(journal.initialized).toBe(false);
  });

  it('R03-10a matching read-back uses no PATCH, reserves cleanup slots, and only passes after DELETE plus final 404',async()=>{
    const provider=mockProvider();
    const journal=new MemoryJournal();
    const result=await runP1T15R03({live:true,liveAuthorized:true,env:env(),transport:provider.transport,journal,maxRequests:7});
    expect(result.result).toBe('PASS');
    expect(result.classification).toBe('COMMENT_AUTOMATION_READBACK_DIAGNOSTIC_COMPLETED');
    expect(result.errorCategory).toBeNull();
    expect(result.cleanup).toBe('CLEANUP_VERIFIED');
    expect(result.counters).toMatchObject({providerRequests:7,creates:1,enablePatches:0,disablePatches:0,deletes:1,retries:0});
    expect(result.requests).toHaveLength(7);
    expect(provider.requests.some(r=>r.method==='PATCH')).toBe(false);
    expect(provider.requests.at(-3)?.method).toBe('GET');
    expect(provider.requests.at(-2)?.method).toBe('DELETE');
    expect(provider.requests.at(-1)?.method).toBe('GET');
    expect(provider.requests.at(-1)?.url).toBe(`/v1/comment-automations/${AUTO}`);
    expect(provider.exists).toBe(false);
    expect(provider.requests.find(r=>r.method==='POST')?.body).toEqual(p1T15CreateBody());
    expect(journal.rows.find(row=>row.stage==='CLEANUP_COMPLETED')).toMatchObject({deleteStatus:200,finalGetStatus:404,residualState:'ABSENT'});
    expect(journal.rows.findIndex(row=>row.stage==='READBACK_DIAGNOSTIC_CAPTURED')).toBeLessThan(journal.rows.findIndex(row=>row.stage==='CLEANUP_COMPLETED'));
    const evidence=JSON.stringify(journal.rows);
    for(const value of [P1_T15_DM_MESSAGE,P1_T15_KEYWORD,P1_T15_AUTOMATION_NAME,API,EMAIL])expect(evidence).not.toContain(value);
    expect(result.counters.providerRequests).toBeLessThanOrEqual(7);
  });

  it('R03-10 synthetic mock read-back mismatch captures only safe field-level diagnostics and cleans up',async()=>{
    const provider=mockProvider({readbackMismatch:'name'});
    const journal=new MemoryJournal();
    const result=await runP1T15R03({live:true,liveAuthorized:true,env:env(),transport:provider.transport,journal});
    expect(result.errorCategory).toBe('SAFETY_DISABLED_READBACK_CONFIG_MISMATCH');
    expect(result.result).toBe('FAIL');
    expect(result.cleanup).toBe('CLEANUP_VERIFIED');
    expect(result.counters).toMatchObject({providerRequests:7,creates:1,enablePatches:0,disablePatches:0,deletes:1,retries:0});
    expect(result.requests).toHaveLength(7);
    const diagnostic=journal.rows.find(row=>row.stage==='READBACK_DIAGNOSTIC_CAPTURED');
    expect(diagnostic).toBeDefined();
    expect(diagnostic?.requestId).toBe('readback-r03');
    expect((diagnostic?.diagnostic as ReturnType<typeof diag>).accepted).toBe(false);
    expect(field(diagnostic?.diagnostic as ReturnType<typeof diag>,'name')).toMatchObject({accepted:false,mismatchCategory:'VALUE_MISMATCH'});
    expect(journal.rows.map(row=>row.stage)).toContain('CLEANUP_COMPLETED');
    expect(journal.rows.findIndex(row=>row.stage==='READBACK_DIAGNOSTIC_CAPTURED')).toBeLessThan(journal.rows.findIndex(row=>row.stage==='CLEANUP_COMPLETED'));
    const serialized=JSON.stringify(journal.rows);
    expect(serialized).not.toContain('R03_SYNTHETIC_MISMATCH_SENTINEL');
    expect(serialized).not.toContain(P1_T15_DM_MESSAGE);
    expect(serialized).not.toContain(API);
    expect(serialized).not.toContain(EMAIL);
    expect(provider.requests.some(r=>r.method==='PATCH')).toBe(false);
    expect(provider.requests.filter(r=>r.method==='POST')).toHaveLength(1);
    expect(provider.requests.some(r=>(r.url??'').includes('/logs'))).toBe(false);
  });

  it('R03-10b successful create without an addressable ID fails with cleanup UNKNOWN, never PASS',async()=>{
    const provider=mockProvider({createWithoutId:true});
    const journal=new MemoryJournal();
    const result=await runP1T15R03({live:true,liveAuthorized:true,env:env(),transport:provider.transport,journal,maxRequests:7});
    expect(result.result).toBe('FAIL');
    expect(result.errorCategory).toBe('SAFETY_CREATE_SUCCEEDED_WITHOUT_AUTOMATION_ID');
    expect(result.cleanup).toBe('CLEANUP_UNSAFE_OR_UNKNOWN');
    expect(result.counters.providerRequests).toBe(4);
    expect(provider.requests.some(r=>r.method==='PATCH'||r.method==='DELETE')).toBe(false);
    expect(provider.exists).toBe(true);
    expect(journal.rows.some(row=>row.stage==='CLEANUP_COMPLETED'&&row.residualState==='ABSENT')).toBe(false);
  });

  it('R03-11 active create response performs immediate DELETE/final read-back and never PATCHes',async()=>{
    const provider=mockProvider({createActive:true});
    const journal=new MemoryJournal();
    const result=await runP1T15R03({live:true,liveAuthorized:true,env:env(),transport:provider.transport,journal,maxRequests:99});
    expect(result.classification).toBe('NATIVE_AUTOMATION_SAFETY_FAILURE');
    expect(result.result).toBe('FAIL');
    expect(result.errorCategory).toBe('R03_CREATE_RESPONSE_ACTIVE');
    expect(result.cleanup).toBe('CLEANUP_VERIFIED');
    expect(result.counters).toMatchObject({providerRequests:6,creates:1,enablePatches:0,disablePatches:0,deletes:1,retries:0});
    expect(result.counters.providerRequests).toBeLessThanOrEqual(9);
    expect(provider.requests.some(r=>r.method==='PATCH')).toBe(false);
    expect(provider.requests.at(-2)?.method).toBe('DELETE');
    expect(provider.requests.at(-1)?.method).toBe('GET');
    expect(provider.exists).toBe(false);
  });

  it('R03-11a active read-back is rejected and cleaned up without any PATCH',async()=>{
    const provider=mockProvider({readbackActiveAfterCreate:true,missingTriggerEvidence:true});
    const journal=new MemoryJournal();
    const result=await runP1T15R03({live:true,liveAuthorized:true,env:env(),transport:provider.transport,journal,maxRequests:99});
    expect(result.classification).toBe('NATIVE_AUTOMATION_SAFETY_FAILURE');
    expect(result.result).toBe('FAIL');
    expect(result.errorCategory).toBe('R03_READBACK_ACTIVE');
    expect(result.cleanup).toBe('CLEANUP_VERIFIED');
    expect(result.counters).toMatchObject({providerRequests:7,creates:1,enablePatches:0,disablePatches:0,deletes:1,retries:0});
    expect(provider.requests).toHaveLength(7);
    expect(provider.requests.some(r=>r.method==='PATCH')).toBe(false);
    expect(provider.requests.at(-2)?.method).toBe('DELETE');
    expect(provider.requests.at(-1)?.method).toBe('GET');
    expect(provider.exists).toBe(false);
  });

  it('R03-11b insufficient caller budget blocks before any request and preserves cleanup reservation',async()=>{
    const provider=mockProvider();
    const result=await runP1T15R03({live:true,liveAuthorized:true,env:env(),transport:provider.transport,journal:new MemoryJournal(),maxRequests:6});
    expect(result.result).toBe('BLOCKED');
    expect(result.errorCategory).toBe('R03_REQUEST_BUDGET_INSUFFICIENT_FOR_CLEANUP_RESERVATION');
    expect(result.counters.providerRequests).toBe(0);
    expect(provider.requests).toHaveLength(0);
  });

  it('R03-12 cleanup uncertainty is not misreported as verified',async()=>{
    const provider=mockProvider({readbackMismatch:'name',deleteStatus:500});
    const journal=new MemoryJournal();
    const result=await runP1T15R03({live:true,liveAuthorized:true,env:env(),transport:provider.transport,journal});
    expect(result.cleanup).toBe('CLEANUP_UNSAFE_OR_UNKNOWN');
    expect(result.classification).toBe('NATIVE_AUTOMATION_SAFETY_FAILURE');
    expect(result.result).toBe('FAIL');
    expect(result.counters.providerRequests).toBeLessThanOrEqual(9);
    expect(journal.rows.some(row=>row.stage==='CLEANUP_COMPLETED'&&(row.residualState==='ABSENT'||row.residualState==='DISABLED'))).toBe(false);
  });

  it('R03-12a successful DELETE with unresolved final read-back never claims absence or success',async()=>{
    const provider=mockProvider({finalGetStatus:503});
    const journal=new MemoryJournal();
    const result=await runP1T15R03({live:true,liveAuthorized:true,env:env(),transport:provider.transport,journal,maxRequests:7});
    expect(result.result).toBe('FAIL');
    expect(result.cleanup).toBe('CLEANUP_UNSAFE_OR_UNKNOWN');
    expect(result.errorCategory).toBe('R03_CLEANUP_FINAL_READBACK_UNRESOLVED');
    expect(result.counters.providerRequests).toBe(7);
    expect(provider.requests.some(r=>r.method==='PATCH')).toBe(false);
    expect(journal.rows.some(row=>row.stage==='CLEANUP_COMPLETED'&&row.residualState==='ABSENT')).toBe(false);
    expect(journal.rows.find(row=>row.stage==='CLEANUP_COMPLETED')).toMatchObject({deleteStatus:200,finalGetStatus:503,residualState:'UNKNOWN'});
  });

  it('R03-12b failed DELETE cannot claim absence even when a later GET returns 404',async()=>{
    const provider=mockProvider({readbackMismatch:'name',deleteStatus:500,deleteRemovesDespiteFailure:true});
    const journal=new MemoryJournal();
    const result=await runP1T15R03({live:true,liveAuthorized:true,env:env(),transport:provider.transport,journal,maxRequests:7});
    expect(result.result).toBe('FAIL');
    expect(result.cleanup).toBe('CLEANUP_UNSAFE_OR_UNKNOWN');
    expect(result.errorCategory).toBe('R03_CLEANUP_DELETE_FAILED');
    expect(result.counters.providerRequests).toBe(7);
    expect(journal.rows.some(row=>row.stage==='CLEANUP_COMPLETED'&&row.residualState==='ABSENT')).toBe(false);
    expect(journal.rows.find(row=>row.stage==='CLEANUP_COMPLETED')).toMatchObject({deleteStatus:500,finalGetStatus:404,residualState:'UNKNOWN',deleteFailed:true});
  });

  it('R03-13 fixed journal refuses secrets and private fields before persistence',async()=>{
    const journal=new FixedP1T15R03Journal();
    await journal.initialize([API,EMAIL]);
    await expect(journal.append('READBACK_DIAGNOSTIC_CAPTURED',{apiKey:API},[API,EMAIL])).rejects.toThrow('SAFETY_EVIDENCE_SECRET_OR_PII_LEAK_PREVENTED');
    await expect(journal.append('READBACK_DIAGNOSTIC_CAPTURED',{commenterName:'real-user'},[API,EMAIL])).rejects.toThrow('SAFETY_EVIDENCE_SECRET_OR_PII_LEAK_PREVENTED');
    const contents=await readFile(P1_T15_R03_EVIDENCE_PATH,'utf8');
    expect(contents).not.toContain(API);
    expect(contents).not.toContain(EMAIL);
    expect(contents).not.toContain('real-user');
  });
});
