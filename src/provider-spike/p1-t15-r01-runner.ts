import { createHash } from 'node:crypto';
import { mkdir, open } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createZernioLiveTransport } from './p1-t02-zernio.js';
import type { ProviderTransport, ProviderTransportRequest, ProviderTransportResponse } from './types.js';

export const P1_T15_R01_PROFILE_ID='6ac5a45a8e4ca44f355033ae';
export const P1_T15_R01_ACCOUNT_ID='6ac64f8740364f4695dd3077';
export const P1_T15_R01_PAGE_ID='1387424501114639';
export const P1_T15_R01_ZERNIO_POST_ID='6ada5bc404775bbecc763501';
export const P1_T15_R01_PLATFORM_POST_ID='1387424501114639_122110940457502015';
export const P1_T15_R01_POST_CONTENT='MarketlyAI internal organic comments fixture. No action required.';
export const P1_T15_R01_POST_SHA256='db58ab9f9a09803d402dfe975d204baaeec1f9dc828c0f3c541833a84fc03113';
export const P1_T15_R01_EVIDENCE_PATH='artifacts/provider-spike/p1-t15-r01-evidence.jsonl';
export const P1_T15_R01_REQUEST_MAX=3;

type Obj=Record<string,unknown>;
type Result='PASS'|'BLOCKED'|'FAIL';
export type P1T15R01Classification=
 |'FROZEN_POST_RESPONSE_SHAPE_DRIFT_CONFIRMED'
 |'FROZEN_POST_CONTENT_DRIFT_CONFIRMED'
 |'FROZEN_POST_TARGET_IDENTITY_DRIFT_CONFIRMED'
 |'FROZEN_POST_ABSENT'
 |'FROZEN_POST_DIAGNOSTIC_BLOCKED'
 |'DIAGNOSTIC_SAFETY_FAILURE';
export type P1T15R01Stage='RUN_STARTED'|'IDENTITY_VERIFIED'|'ACCOUNT_SCOPE_VERIFIED'|'POST_DIAGNOSTIC_CAPTURED'|'RUN_FINALIZED';

export interface P1T15R01RequestEvidence{ordinal:number;method:'GET';path:string;status:number|null;requestId:string|null;}
export interface P1T15R01AccountProjection{httpStatus:number|null;requestId:string|null;frozenAccountMatchCount:number;frozenProfileMatch:boolean|null;facebookPlatformMatch:boolean|null;ownershipGatePass:boolean;}
export interface P1T15R01PostProjection{
 httpStatus:number|null;requestId:string|null;
 postEnvelopeSource:'root'|'post'|'none';
 postIdFieldPresent:boolean;postIdMatch:boolean|null;postIdSource:string|null;
 contentFieldPresent:boolean;contentUtf8Bytes:number|null;contentSha256:string|null;contentHashMatch:boolean|null;contentSource:string|null;
 facebookPlatformEntryCount:number;facebookPlatformEntryPresent:boolean;
 accountIdFieldPresent:boolean;accountIdMatch:boolean|null;accountIdSource:string|null;
 platformPostIdFieldPresent:boolean;platformPostIdMatch:boolean|null;platformPostIdSource:string|null;
 pageIdDirectFieldPresent:boolean;pageIdNestedFieldPresent:boolean;pageIdDerivableFromPlatformPostId:boolean;pageIdMatch:boolean|null;pageIdSource:string|null;
 platformFieldPresent:boolean;platformFacebookMatch:boolean|null;platformSource:string|null;
 legacyP1T15AttestationWouldPass:boolean;
}
export interface P1T15R01Journal{initialize(forbidden:string[]):Promise<void>;append(stage:P1T15R01Stage,fields:Obj,forbidden:string[]):Promise<void>;}
export interface P1T15R01RunOptions{live?:boolean;env?:NodeJS.ProcessEnv;transport?:ProviderTransport;journal?:P1T15R01Journal;maxRequests?:number;}
export interface P1T15R01RunResult{
 liveEnabled:boolean;result:Result;classification:P1T15R01Classification;errorCategory:string|null;
 account:P1T15R01AccountProjection|null;projection:P1T15R01PostProjection|null;
 providerRequestCount:number;retries:0;mutations:0;automationCalls:0;commentsCreated:0;dmsSent:0;adsMediaWebhookMutations:0;p1T14Requests:0;
 requests:P1T15R01RequestEvidence[];secretsPersisted:0;rawProviderPayloadsPersisted:0;
 frozenFixtureSafelyUsable:boolean|null;parserFixAppearsSufficient:boolean|null;lifecycleRerunPerformed:false;
}

const obj=(v:unknown):Obj|null=>typeof v==='object'&&v!==null&&!Array.isArray(v)?v as Obj:null;
const text=(v:unknown)=>typeof v==='string'&&v.length?v:null;
const status=(r:ProviderTransportResponse)=>typeof r.status==='number'?r.status:null;
const sha=(v:string)=>createHash('sha256').update(v,'utf8').digest('hex');
const pathOf=(u:string)=>u.split('?')[0]??u;
const requestId=(r:ProviderTransportResponse)=>{for(const[k,v]of Object.entries(r.headers??{}))if((k.toLowerCase()==='x-request-id'||k.toLowerCase()==='x-correlation-id')&&v)return v;return null;};
const directValueId=(v:unknown):string|null=>{if(typeof v==='string'&&v)return v;const o=obj(v);return o?text(o._id)??text(o.id)??text(o.accountId):null;};
const safeError=(e:unknown)=>{const m=e instanceof Error?e.message:'PROVIDER_TRANSPORT_ERROR';if(m.startsWith('SAFETY_'))return m;if(/timeout|network|abort/i.test(m))return'PROVIDER_NETWORK_OR_TIMEOUT';return m;};

function evidenceSensitive(serialized:string,forbidden:string[]){
 if(/Authorization\s*[:=]|Bearer\s+[A-Za-z0-9._~+\/-]+/i.test(serialized))return true;
 if(/"(?:raw|body|payload|content|contentText|returnedId|unexpectedId)"\s*:/i.test(serialized))return true;
 return forbidden.filter(Boolean).some(v=>serialized.includes(v));
}

export class FixedP1T15R01Journal implements P1T15R01Journal{
 private seq=0;
 async initialize(forbidden:string[]){
  await mkdir(dirname(P1_T15_R01_EVIDENCE_PATH),{recursive:true});
  try{const h=await open(P1_T15_R01_EVIDENCE_PATH,'wx');await h.sync();await h.close();}
  catch(e){throw new Error((e as NodeJS.ErrnoException).code==='EEXIST'?'SAFETY_EVIDENCE_FILE_ALREADY_EXISTS':'EVIDENCE_FILE_INIT_FAILED');}
  if(evidenceSensitive(P1_T15_R01_EVIDENCE_PATH,forbidden))throw new Error('SAFETY_EVIDENCE_PATH_INVALID');
 }
 async append(stage:P1T15R01Stage,fields:Obj,forbidden:string[]){
  const line=JSON.stringify({sequence:++this.seq,utcTimestamp:new Date().toISOString(),stage,...fields});
  if(evidenceSensitive(line,forbidden))throw new Error('SAFETY_EVIDENCE_LEAK_PREVENTED');
  const h=await open(P1_T15_R01_EVIDENCE_PATH,'a');const b=Buffer.from(`${line}\n`,'utf8');const w=await h.write(b,0,b.length,null);await h.sync();await h.close();
  if(w.bytesWritten!==b.length)throw new Error('EVIDENCE_PARTIAL_WRITE');
 }
}

export function parseP1T15R01Args(argv:string[]){if(argv.length===0)return{ok:true as const,live:false};if(argv.length===1&&argv[0]==='--live')return{ok:true as const,live:true};return{ok:false as const,live:false};}

function fieldCandidate(parent:Obj|null,field:string,base:string){
 if(!parent||!Object.prototype.hasOwnProperty.call(parent,field))return{present:false,value:null as string|null,source:null as string|null};
 const raw=parent[field];const direct=text(raw);if(direct)return{present:true,value:direct,source:`${base}.${field}`};
 const nested=obj(raw);if(!nested)return{present:true,value:null,source:`${base}.${field}`};
 for(const k of ['id','_id','accountId'] as const){const v=text(nested[k]);if(v)return{present:true,value:v,source:`${base}.${field}.${k}`};}
 return{present:true,value:null,source:`${base}.${field}`};
}

function postEnvelope(body:unknown){const root=obj(body);if(!root)return{post:null as Obj|null,source:'none' as const};const nested=obj(root.post);return nested?{post:nested,source:'post' as const}:{post:root,source:'root' as const};}

export function projectFrozenPost(response:ProviderTransportResponse):P1T15R01PostProjection{
 const httpStatus=status(response),rid=requestId(response),env=postEnvelope(response.body),post=env.post;
 const postIdFields=['_id','id','postId'] as const;let postIdPresent=false,postIdValue:string|null=null,postIdSource:string|null=null;
 if(post)for(const k of postIdFields){if(Object.prototype.hasOwnProperty.call(post,k)){postIdPresent=true;const v=text(post[k]);if(v){postIdValue=v;postIdSource=`${env.source}.${k}`;break;}if(!postIdSource)postIdSource=`${env.source}.${k}`;}}
 const contentPresent=Boolean(post&&Object.prototype.hasOwnProperty.call(post,'content')),contentValue=contentPresent?text(post?.content):null;
 const platforms=post&&Array.isArray(post.platforms)?post.platforms.map(obj).filter((x):x is Obj=>Boolean(x)):[];
 const fbEntries=platforms.filter(x=>text(x.platform)==='facebook'),fb:Obj|null=fbEntries.length===1?(fbEntries[0]??null):null;
 const accountDirect=fieldCandidate(fb,'accountId','platform');
 const accountNested=fieldCandidate(fb,'account','platform');
 const account=accountDirect.value?accountDirect:accountNested.value?accountNested:accountDirect.present?accountDirect:accountNested;
 const platformPost=fieldCandidate(fb,'platformPostId','platform');
 const directPage=fieldCandidate(fb,'pageId','platform');const psd=obj(fb?.platformSpecificData);const nestedPage=fieldCandidate(psd,'pageId','platform.platformSpecificData');
 const derivable=Boolean(platformPost.value?.match(/^([1-9]\d*)_[1-9]\d*$/));const derivedPage=platformPost.value?.match(/^([1-9]\d*)_[1-9]\d*$/)?.[1]??null;
 const pageValue=directPage.value??nestedPage.value??derivedPage;const pageSource=directPage.value?directPage.source:nestedPage.value?nestedPage.source:derivedPage?'platform.platformPostId[derived-page]':null;
 const platformPresent=Boolean(fb&&Object.prototype.hasOwnProperty.call(fb,'platform')),platformValue=fb?text(fb.platform):null;
 const legacyPostId=post?directValueId(post):null,legacyFb=platforms.find(x=>text(x.platform)==='facebook')??null,legacyPsd=obj(legacyFb?.platformSpecificData),legacyPlatformPost=text(legacyFb?.platformPostId),legacyPage=text(legacyFb?.pageId)??text(legacyPsd?.pageId)??legacyPlatformPost?.match(/^([1-9]\d*)_[1-9]\d*$/)?.[1]??null;
 const legacyPass=httpStatus===200&&legacyPostId===P1_T15_R01_ZERNIO_POST_ID&&text(post?.content)===P1_T15_R01_POST_CONTENT&&sha(text(post?.content)??'')===P1_T15_R01_POST_SHA256&&text(legacyFb?.accountId)===P1_T15_R01_ACCOUNT_ID&&legacyPlatformPost===P1_T15_R01_PLATFORM_POST_ID&&legacyPage===P1_T15_R01_PAGE_ID;
 return{
  httpStatus,requestId:rid,postEnvelopeSource:env.source,
  postIdFieldPresent:postIdPresent,postIdMatch:postIdValue?postIdValue===P1_T15_R01_ZERNIO_POST_ID:null,postIdSource,
  contentFieldPresent:contentPresent,contentUtf8Bytes:contentValue!==null?Buffer.byteLength(contentValue,'utf8'):null,contentSha256:contentValue!==null?sha(contentValue):null,contentHashMatch:contentValue!==null?sha(contentValue)===P1_T15_R01_POST_SHA256:null,contentSource:contentPresent?`${env.source}.content`:null,
  facebookPlatformEntryCount:fbEntries.length,facebookPlatformEntryPresent:fbEntries.length>0,
  accountIdFieldPresent:account.present,accountIdMatch:account.value?account.value===P1_T15_R01_ACCOUNT_ID:null,accountIdSource:account.source,
  platformPostIdFieldPresent:platformPost.present,platformPostIdMatch:platformPost.value?platformPost.value===P1_T15_R01_PLATFORM_POST_ID:null,platformPostIdSource:platformPost.source,
  pageIdDirectFieldPresent:directPage.present,pageIdNestedFieldPresent:nestedPage.present,pageIdDerivableFromPlatformPostId:derivable,pageIdMatch:pageValue?pageValue===P1_T15_R01_PAGE_ID:null,pageIdSource:pageSource,
  platformFieldPresent:platformPresent,platformFacebookMatch:platformValue?platformValue==='facebook':null,platformSource:platformPresent?'platform.platform':null,
  legacyP1T15AttestationWouldPass:legacyPass,
 };
}

export function classifyProjection(p:P1T15R01PostProjection):P1T15R01Classification{
 if(p.httpStatus===404)return'FROZEN_POST_ABSENT';
 if(p.httpStatus!==200)return'FROZEN_POST_DIAGNOSTIC_BLOCKED';
 const explicitTargetMismatch=(p.postIdMatch===false)||(p.facebookPlatformEntryCount===0)||(p.facebookPlatformEntryCount>1)||(p.accountIdMatch===false)||(p.platformPostIdMatch===false)||(p.pageIdMatch===false)||(p.platformFacebookMatch===false);
 if(explicitTargetMismatch)return'FROZEN_POST_TARGET_IDENTITY_DRIFT_CONFIRMED';
 const requiredKnown=p.postIdFieldPresent&&p.postIdMatch===true&&p.contentFieldPresent&&p.contentHashMatch!==null&&p.facebookPlatformEntryCount===1&&p.accountIdFieldPresent&&p.accountIdMatch===true&&p.platformPostIdFieldPresent&&p.platformPostIdMatch===true&&(p.pageIdDirectFieldPresent||p.pageIdNestedFieldPresent||p.pageIdDerivableFromPlatformPostId)&&p.pageIdMatch===true&&p.platformFieldPresent&&p.platformFacebookMatch===true;
 if(!requiredKnown)return'FROZEN_POST_DIAGNOSTIC_BLOCKED';
 if(p.contentHashMatch===false)return'FROZEN_POST_CONTENT_DRIFT_CONFIRMED';
 if(!p.legacyP1T15AttestationWouldPass)return'FROZEN_POST_RESPONSE_SHAPE_DRIFT_CONFIRMED';
 return'FROZEN_POST_DIAGNOSTIC_BLOCKED';
}

export async function runP1T15R01(options:P1T15R01RunOptions={}):Promise<P1T15R01RunResult>{
 const live=options.live===true,env=options.env??process.env,requests:P1T15R01RequestEvidence[]=[];let account:P1T15R01AccountProjection|null=null,projection:P1T15R01PostProjection|null=null,classification:P1T15R01Classification='FROZEN_POST_DIAGNOSTIC_BLOCKED',result:Result='BLOCKED',errorCategory:string|null=null;
 const max=Math.min(P1_T15_R01_REQUEST_MAX,Math.max(1,Math.trunc(options.maxRequests??P1_T15_R01_REQUEST_MAX)));
 const finish=():P1T15R01RunResult=>({liveEnabled:live,result,classification,errorCategory,account,projection,providerRequestCount:requests.length,retries:0,mutations:0,automationCalls:0,commentsCreated:0,dmsSent:0,adsMediaWebhookMutations:0,p1T14Requests:0,requests,secretsPersisted:0,rawProviderPayloadsPersisted:0,frozenFixtureSafelyUsable:classification==='FROZEN_POST_RESPONSE_SHAPE_DRIFT_CONFIRMED'?true:['FROZEN_POST_CONTENT_DRIFT_CONFIRMED','FROZEN_POST_TARGET_IDENTITY_DRIFT_CONFIRMED','FROZEN_POST_ABSENT'].includes(classification)?false:null,parserFixAppearsSufficient:classification==='FROZEN_POST_RESPONSE_SHAPE_DRIFT_CONFIRMED'?true:['FROZEN_POST_CONTENT_DRIFT_CONFIRMED','FROZEN_POST_TARGET_IDENTITY_DRIFT_CONFIRMED','FROZEN_POST_ABSENT'].includes(classification)?false:null,lifecycleRerunPerformed:false});
 if(!live){errorCategory='LIVE_OPT_IN_REQUIRED';return finish();}
 if(sha(P1_T15_R01_POST_CONTENT)!==P1_T15_R01_POST_SHA256){classification='DIAGNOSTIC_SAFETY_FAILURE';result='FAIL';errorCategory='SAFETY_FROZEN_EXPECTED_HASH_MISMATCH';return finish();}
 const apiKey=env.ZERNIO_API_KEY?.trim(),expectedIdentity=env.ZERNIO_EXPECTED_USER_EMAIL?.trim().toLowerCase(),transport=options.transport??(apiKey?createZernioLiveTransport(apiKey):undefined);
 if(!transport||!apiKey||!expectedIdentity){errorCategory='MISSING_LIVE_CREDENTIAL_OR_EXPECTED_IDENTITY';return finish();}
 const forbidden=[apiKey,expectedIdentity,P1_T15_R01_POST_CONTENT],journal=options.journal??new FixedP1T15R01Journal();
 try{await journal.initialize(forbidden);await journal.append('RUN_STARTED',{expectedContentSha256:P1_T15_R01_POST_SHA256,requestMax:max,readOnly:true},forbidden);}catch(e){classification='DIAGNOSTIC_SAFETY_FAILURE';result='FAIL';errorCategory=safeError(e);return finish();}
 const send=async(request:ProviderTransportRequest)=>{
  if(requests.length>=max)throw new Error('SAFETY_REQUEST_CEILING_VIOLATION');
  const method=(request.method??'GET').toUpperCase(),url=request.url??'',path=pathOf(url),allowed=(method==='GET'&&path==='/v1/auth/verify')||(method==='GET'&&path==='/v1/accounts'&&url===`/v1/accounts?profileId=${encodeURIComponent(P1_T15_R01_PROFILE_ID)}`)||(method==='GET'&&path===`/v1/posts/${P1_T15_R01_ZERNIO_POST_ID}`&&url===`/v1/posts/${P1_T15_R01_ZERNIO_POST_ID}`);
  if(!allowed)throw new Error('SAFETY_ENDPOINT_NOT_AUTHORIZED');
  const ordinal=requests.length+1;try{const r=await transport.send(request,{signal:AbortSignal.timeout(7000)});requests.push({ordinal,method:'GET',path,status:status(r),requestId:requestId(r)});return r;}catch(e){requests.push({ordinal,method:'GET',path,status:null,requestId:null});throw e;}
 };
 try{
  const identity=await send({method:'GET',url:'/v1/auth/verify',safeMetadata:{task:'P1-T15-R01',purpose:'trusted-provider-identity'}}),ib=obj(identity.body),actual=text(ib?.email)?.trim().toLowerCase(),identityMatch=status(identity)===200&&ib?.valid===true&&actual===expectedIdentity;
  await journal.append('IDENTITY_VERIFIED',{httpStatus:status(identity),requestId:requestId(identity),expectedIdentityMatch:identityMatch},forbidden);
  if(!identityMatch){classification='FROZEN_POST_DIAGNOSTIC_BLOCKED';result='BLOCKED';errorCategory='TRUSTED_IDENTITY_UNVERIFIED';throw new Error('STOP_DIAGNOSTIC');}
  const ar=await send({method:'GET',url:`/v1/accounts?profileId=${encodeURIComponent(P1_T15_R01_PROFILE_ID)}`,safeMetadata:{task:'P1-T15-R01',purpose:'exact-account-scope'}}),root=obj(ar.body),rows=Array.isArray(root?.accounts)?root.accounts.map(obj).filter((x):x is Obj=>Boolean(x)):[],matches=rows.filter(x=>directValueId(x)===P1_T15_R01_ACCOUNT_ID),matched=matches.length===1?matches[0]:null,profileMatch=matched?directValueId(matched.profileId??matched.profile)===P1_T15_R01_PROFILE_ID:null,platformMatch=matched?text(matched.platform)==='facebook':null;
  account={httpStatus:status(ar),requestId:requestId(ar),frozenAccountMatchCount:matches.length,frozenProfileMatch:profileMatch,facebookPlatformMatch:platformMatch,ownershipGatePass:status(ar)===200&&matches.length===1&&profileMatch===true&&platformMatch===true};
  await journal.append('ACCOUNT_SCOPE_VERIFIED',{...account},forbidden);
  if(!account.ownershipGatePass){classification=status(ar)===200?'FROZEN_POST_TARGET_IDENTITY_DRIFT_CONFIRMED':'FROZEN_POST_DIAGNOSTIC_BLOCKED';result=status(ar)===200?'PASS':'BLOCKED';errorCategory='ACCOUNT_SCOPE_NOT_VERIFIED';throw new Error('STOP_DIAGNOSTIC');}
  const pr=await send({method:'GET',url:`/v1/posts/${P1_T15_R01_ZERNIO_POST_ID}`,safeMetadata:{task:'P1-T15-R01',purpose:'frozen-post-diagnostic'}});projection=projectFrozenPost(pr);classification=classifyProjection(projection);result=classification==='FROZEN_POST_DIAGNOSTIC_BLOCKED'?'BLOCKED':classification==='DIAGNOSTIC_SAFETY_FAILURE'?'FAIL':'PASS';errorCategory=classification==='FROZEN_POST_DIAGNOSTIC_BLOCKED'?'BOUNDED_PROJECTION_INCONCLUSIVE':null;
  await journal.append('POST_DIAGNOSTIC_CAPTURED',{projection},forbidden);
 }catch(e){
  const c=safeError(e);if(c!=='STOP_DIAGNOSTIC'){
   if(c.startsWith('SAFETY_')){classification='DIAGNOSTIC_SAFETY_FAILURE';result='FAIL';errorCategory=c;}
   else if(errorCategory===null){classification='FROZEN_POST_DIAGNOSTIC_BLOCKED';result='BLOCKED';errorCategory=c;}
  }
 }
 try{await journal.append('RUN_FINALIZED',{result,classification,errorCategory,providerRequestCount:requests.length,retries:0,mutations:0,automationCalls:0,p1T14Requests:0,frozenFixtureSafelyUsable:finish().frozenFixtureSafelyUsable,parserFixAppearsSufficient:finish().parserFixAppearsSufficient,lifecycleRerunPerformed:false},forbidden);}catch(e){classification='DIAGNOSTIC_SAFETY_FAILURE';result='FAIL';errorCategory=safeError(e);}
 return finish();
}

async function main(){const parsed=parseP1T15R01Args(process.argv.slice(2));if(!parsed.ok){console.log(JSON.stringify({liveEnabled:false,result:'FAIL',classification:'DIAGNOSTIC_SAFETY_FAILURE',errorCategory:'INVALID_P1_T15_R01_ARGUMENTS',providerRequestCount:0},null,2));process.exitCode=1;return;}const r=await runP1T15R01({live:parsed.live,env:process.env});console.log(JSON.stringify(r,null,2));process.exitCode=r.result==='PASS'?0:r.result==='FAIL'?1:2;}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
