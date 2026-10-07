import { randomUUID } from 'node:crypto';
import { blockProviderSpike, runProviderSpikeCase } from './harness.js';
import type { ProviderSpikeRunResult, ProviderSpikeTestCase, ProviderTransport, ProviderTransportResponse } from './types.js';

const API_BASE='https://zernio.com/api';
const PROFILE_A={testId:'P1-T02-PROFILE-A',name:'aimm-p1-t02-profile-a',description:'AI Marketing Manager Phase 1 provider test — Profile A — P1-T02'} as const;
const PROFILE_B={testId:'P1-T02-PROFILE-B',name:'aimm-p1-t02-profile-b',description:'AI Marketing Manager Phase 1 provider test — Profile B — P1-T02'} as const;
const PROFILE_A_RECORDED_ID='6ac5a45a8e4ca44f355033ae';
const PROFILE_B_RECORDED_ID='6ac5a45b243a942b74bdbaa0';
const SAFE_HEADERS=['content-type','retry-after','x-request-id','x-correlation-id','x-ratelimit-limit','x-ratelimit-remaining','x-ratelimit-reset'] as const;

type JsonObject=Record<string,unknown>;
export interface P1T02IdentityOutcome{expectedIdentityMatch:boolean;}
export interface P1T02ProfileOutcome{expectedProfileName:string;profileId:string|null;createdThisRun:boolean;reconciledExisting:boolean;reconciledAfterUncertainCreate:boolean;httpStatuses:number[];providerRequestIds:string[];}
export interface P1T02ProfileRun{run:ProviderSpikeRunResult;outcome:P1T02ProfileOutcome|null;}
export interface P1T02RunResult{liveEnabled:boolean;preflight:ProviderSpikeRunResult|null;identity:P1T02IdentityOutcome|null;profileA:P1T02ProfileRun|null;profileB:P1T02ProfileRun|null;distinctProfileIds:boolean|null;result:'PASS'|'FAIL'|'BLOCKED';errorCategory:string|null;}
export interface P1T02RunOptions{live?:boolean;env?:NodeJS.ProcessEnv;transport?:ProviderTransport;providerEnvironment?:string;}
export interface P1T02F01ProfileOutcome{expectedProfileName:string;expectedProfileId:string;observedProfileId:string|null;profileIdMatch:boolean;providerRequestIds:string[];httpStatuses:number[];}
export interface P1T02F01ProfileRun{run:ProviderSpikeRunResult;outcome:P1T02F01ProfileOutcome|null;}
export interface P1T02F01RunResult{liveEnabled:boolean;identityRun:ProviderSpikeRunResult|null;identity:P1T02IdentityOutcome|null;profileA:P1T02F01ProfileRun|null;profileB:P1T02F01ProfileRun|null;distinctProfileIds:boolean|null;result:'PASS'|'BLOCKED';errorCategory:string|null;}

function obj(value:unknown):JsonObject|null{return typeof value==='object'&&value!==null&&!Array.isArray(value)?value as JsonObject:null;}
function header(response:ProviderTransportResponse,name:string){const target=name.toLowerCase();for(const [key,value] of Object.entries(response.headers??{}))if(key.toLowerCase()===target&&value)return value;return undefined;}
function requestId(response:ProviderTransportResponse){return header(response,'x-request-id')??header(response,'x-correlation-id');}
function numericStatus(response:ProviderTransportResponse){return typeof response.status==='number'?response.status:null;}
function category(error:unknown){return obj(error)?.category as string|undefined;}
function profileId(profile:JsonObject){const value=profile._id??profile.id;return typeof value==='string'&&value.length>0?value:null;}
function profileName(profile:JsonObject){return typeof profile.name==='string'?profile.name:null;}
function normalizeEmail(value:unknown){if(typeof value!=='string')return null;const normalized=value.trim().toLowerCase();return normalized&&/^[^\s@]+@[^\s@]+$/.test(normalized)?normalized:null;}
function exactProfiles(body:unknown,name:string){const root=obj(body);if(!root||!Array.isArray(root.profiles))blockProviderSpike('MALFORMED_PROVIDER_RESPONSE','Profile list response is missing profiles array.');return root.profiles.map(obj).filter((p):p is JsonObject=>Boolean(p)).filter(p=>profileName(p)===name);}
function assertReadableProfile(body:unknown,name:string){const matches=exactProfiles(body,name);if(matches.length>1)blockProviderSpike('AMBIGUOUS_PROFILE_STATE','Exact-name lookup returned multiple Profiles.');if(matches.length===0)return null;const id=profileId(matches[0]!);if(!id)blockProviderSpike('MALFORMED_PROVIDER_RESPONSE','Resolved Profile is missing provider ID.');return {id,name};}
function blockReadStatus(response:ProviderTransportResponse,operation:string){const status=numericStatus(response);if(status===401||status===403)blockProviderSpike('PROVIDER_AUTHORIZATION_BLOCKED',`${operation} was not authorized.`);if(status===429)blockProviderSpike('HTTP_429',`${operation} was rate limited.`);if(status!==null&&status>=500)blockProviderSpike('PROVIDER_5XX_BLOCKED',`${operation} returned provider 5xx.`);if(status!==200)blockProviderSpike('PROVIDER_HTTP_BLOCKED',`${operation} returned unexpected status ${String(response.status)}.`);}
function isUncertainWriteError(error:unknown){const c=category(error);return c==='TIMEOUT'||c==='NETWORK_ERROR';}
function redactionSecrets(env:NodeJS.ProcessEnv){return env.ZERNIO_EXPECTED_USER_EMAIL?[env.ZERNIO_EXPECTED_USER_EMAIL]:[];}

export function createZernioLiveTransport(apiKey:string,fetchImpl:typeof fetch=fetch):ProviderTransport{
 if(!apiKey)throw new Error('ZERNIO_API_KEY is required to construct live transport.');
 return {kind:'live',send:async(request,{signal})=>{
  const path=request.url??'';if(!path.startsWith('/v1/'))throw new Error('Zernio spike transport only permits /v1/ paths.');
  const headers=new Headers(request.headers??{});headers.set('Authorization',`Bearer ${apiKey}`);headers.set('Accept','application/json');
  const init:RequestInit={method:request.method??'GET',headers,signal};if(request.body!==undefined){headers.set('Content-Type','application/json');init.body=JSON.stringify(request.body);}
  const response=await fetch(`${API_BASE}${path}`,init);const text=await response.text();let body:unknown=null;if(text){try{body=JSON.parse(text);}catch{body=text;}}
  return {status:response.status,headers:Object.fromEntries(response.headers.entries()),body};
 }};
}

function commonCase(mode:'offline'|'live',providerEnvironment:string):Pick<ProviderSpikeTestCase,'provider'|'capability'|'providerEnvironment'|'mode'|'timeoutMs'|'maxRequests'|'requiredCredentialEnvVars'|'liveSafety'|'safeResponseHeaders'|'requestIdExtractor'>{
 return {provider:'Zernio',capability:'Profiles',providerEnvironment,mode,timeoutMs:5000,maxRequests:3,requiredCredentialEnvVars:['ZERNIO_API_KEY'],liveSafety:{enabled:mode==='live'},safeResponseHeaders:SAFE_HEADERS,requestIdExtractor:requestId};
}

export function createP1T02TeamPreflightCase(mode:'offline'|'live',expectedEmail:string|undefined,providerEnvironment='zernio-test-team',capture?:(outcome:P1T02IdentityOutcome)=>void):ProviderSpikeTestCase{
 return {testId:'P1-T02-AUTH-PREFLIGHT',...commonCase(mode,providerEnvironment),maxRequests:1,execute:async context=>{
  if(mode==='offline')return {ok:true,expectedIdentityMatch:false};
  if(!expectedEmail?.trim())blockProviderSpike('EXPECTED_PROVIDER_IDENTITY_MISSING','Trusted expected provider identity is required.');
  const expected=normalizeEmail(expectedEmail);if(!expected)blockProviderSpike('INVALID_TEST_CONFIGURATION','Trusted expected provider identity is not a valid email configuration.');
  const response=await context.request({method:'GET',url:'/v1/auth/verify',safeMetadata:{path:'/v1/auth/verify',purpose:'trusted-provider-identity-preflight'}});blockReadStatus(response,'Trusted provider identity preflight');
  const body=obj(response.body);const actual=normalizeEmail(body?.email);if(body?.valid!==true||!actual)blockProviderSpike('MALFORMED_PROVIDER_RESPONSE','Provider identity verification response is missing a valid authenticated email.');
  const match=actual===expected;capture?.({expectedIdentityMatch:match});if(!match)blockProviderSpike('PROVIDER_TARGET_IDENTITY_MISMATCH','Authenticated provider identity does not match trusted expected identity.');
  return {ok:true,expectedIdentityMatch:true};
 },assert:async observation=>obj(observation)?.expectedIdentityMatch===true};
}

export function createP1T02ProfileCase(spec:typeof PROFILE_A|typeof PROFILE_B,mode:'offline'|'live',providerEnvironment='zernio-test-team',capture?:(outcome:P1T02ProfileOutcome)=>void):ProviderSpikeTestCase{
 return {testId:spec.testId,...commonCase(mode,providerEnvironment),testConfig:{expectedProfileName:spec.name},execute:async context=>{
  if(mode==='offline'){const outcome:P1T02ProfileOutcome={expectedProfileName:spec.name,profileId:null,createdThisRun:false,reconciledExisting:false,reconciledAfterUncertainCreate:false,httpStatuses:[],providerRequestIds:[]};capture?.(outcome);return {ok:true,outcome};}
  const statuses:number[]=[],ids:string[]=[];const record=(response:ProviderTransportResponse)=>{const status=numericStatus(response);if(status!==null)statuses.push(status);const id=requestId(response);if(id)ids.push(id);};
  const lookup=()=>context.request({method:'GET',url:`/v1/profiles?name=${encodeURIComponent(spec.name)}`,safeMetadata:{path:'/v1/profiles',method:'GET',exact_name:spec.name}});
  const preflight=await lookup();record(preflight);blockReadStatus(preflight,'Exact-name profile preflight');const existing=assertReadableProfile(preflight.body,spec.name);
  let createdThisRun=false,reconciledExisting=Boolean(existing),reconciledAfterUncertainCreate=false,uncertainCreate=false;
  if(!existing){
   try{
    const created=await context.request({method:'POST',url:'/v1/profiles',headers:{'Idempotency-Key':randomUUID()},body:{name:spec.name,description:spec.description},safeMetadata:{path:'/v1/profiles',method:'POST',expected_name:spec.name,idempotency_key_present:true}});record(created);const status=numericStatus(created);
    if(status===201)createdThisRun=true;else if(status===409)reconciledExisting=true;else if(status===401||status===403)blockProviderSpike('PROVIDER_AUTHORIZATION_BLOCKED','Profile create was not authorized.');else if(status===429)blockProviderSpike('HTTP_429','Profile create was rate limited.');else if(status!==null&&status>=500)uncertainCreate=true;else blockProviderSpike('PROVIDER_HTTP_BLOCKED',`Profile create returned unexpected status ${String(created.status)}.`);
   }catch(error){if(isUncertainWriteError(error))uncertainCreate=true;else throw error;}
  }
  const readback=await lookup();record(readback);blockReadStatus(readback,'Profile read-back');const verified=assertReadableProfile(readback.body,spec.name);
  if(!verified&&uncertainCreate)blockProviderSpike('UNKNOWN_CREATE_OUTCOME','Profile create outcome remained unknown after exact-name reconciliation.');
  const outcome:P1T02ProfileOutcome={expectedProfileName:spec.name,profileId:verified?.id??null,createdThisRun,reconciledExisting,reconciledAfterUncertainCreate:Boolean(verified&&uncertainCreate),httpStatuses:statuses,providerRequestIds:ids};capture?.(outcome);return {ok:Boolean(verified),outcome};
 },assert:async observation=>Boolean(obj(observation)?.ok)};
}

export function createP1T02F01ProfileReadCase(spec:typeof PROFILE_A|typeof PROFILE_B,expectedProfileId:string,providerEnvironment='authorized-internal-zernio-test-team',capture?:(outcome:P1T02F01ProfileOutcome)=>void):ProviderSpikeTestCase{
 return {testId:`P1-T02-F01-${spec===PROFILE_A?'PROFILE-A':'PROFILE-B'}`,...commonCase('live',providerEnvironment),maxRequests:1,testConfig:{expectedProfileName:spec.name,expectedProfileId},execute:async context=>{
  const response=await context.request({method:'GET',url:`/v1/profiles?name=${encodeURIComponent(spec.name)}`,safeMetadata:{path:'/v1/profiles',method:'GET',exact_name:spec.name}});blockReadStatus(response,'P1-T02-F01 profile verification');const verified=assertReadableProfile(response.body,spec.name);
  const observedId=verified?.id??null;const match=observedId===expectedProfileId;const outcome:P1T02F01ProfileOutcome={expectedProfileName:spec.name,expectedProfileId,observedProfileId:observedId,profileIdMatch:match,providerRequestIds:requestId(response)?[requestId(response)!]:[],httpStatuses:numericStatus(response)!==null?[numericStatus(response)!]:[]};capture?.(outcome);
  if(!verified||!match)blockProviderSpike('PROVIDER_TARGET_PROFILE_ID_MISMATCH','Verified provider Profile does not match the recorded expected Profile identity.');return {ok:true};
 },assert:async observation=>Boolean(obj(observation)?.ok)};
}

export async function runP1T02Profiles(options:P1T02RunOptions={}):Promise<P1T02RunResult>{
 const live=options.live===true,mode=live?'live':'offline',env=options.env??process.env,providerEnvironment=options.providerEnvironment??'zernio-test-team';
 if(!live)return {liveEnabled:false,preflight:null,identity:null,profileA:null,profileB:null,distinctProfileIds:null,result:'BLOCKED',errorCategory:'LIVE_OPT_IN_REQUIRED'};
 const transport=options.transport??(env.ZERNIO_API_KEY?createZernioLiveTransport(env.ZERNIO_API_KEY):undefined);const identityBox:{value:P1T02IdentityOutcome|null}={value:null};
 const preflight=await runProviderSpikeCase(createP1T02TeamPreflightCase(mode,env.ZERNIO_EXPECTED_USER_EMAIL,providerEnvironment,value=>{identityBox.value=value;}),{env,...(transport?{transport}:{}),redactionSecrets:redactionSecrets(env)});
 if(preflight.evidence.result!=='PASS')return {liveEnabled:true,preflight,identity:identityBox.value,profileA:null,profileB:null,distinctProfileIds:null,result:'BLOCKED',errorCategory:preflight.evidence.error_category};
 const outcomeA:{value:P1T02ProfileOutcome|null}={value:null};const runA=await runProviderSpikeCase(createP1T02ProfileCase(PROFILE_A,mode,providerEnvironment,value=>{outcomeA.value=value;}),{env,transport:transport!,redactionSecrets:redactionSecrets(env)});const profileA={run:runA,outcome:outcomeA.value};
 if(runA.evidence.result!=='PASS')return {liveEnabled:true,preflight,identity:identityBox.value,profileA,profileB:null,distinctProfileIds:null,result:runA.evidence.result,errorCategory:runA.evidence.error_category};
 const outcomeB:{value:P1T02ProfileOutcome|null}={value:null};const runB=await runProviderSpikeCase(createP1T02ProfileCase(PROFILE_B,mode,providerEnvironment,value=>{outcomeB.value=value;}),{env,transport:transport!,redactionSecrets:redactionSecrets(env)});const profileB={run:runB,outcome:outcomeB.value};
 if(runB.evidence.result!=='PASS')return {liveEnabled:true,preflight,identity:identityBox.value,profileA,profileB,distinctProfileIds:null,result:runB.evidence.result,errorCategory:runB.evidence.error_category};
 const idA=outcomeA.value?.profileId,idB=outcomeB.value?.profileId;const distinct=Boolean(idA&&idB&&idA!==idB);return {liveEnabled:true,preflight,identity:identityBox.value,profileA,profileB,distinctProfileIds:distinct,result:distinct?'PASS':'FAIL',errorCategory:distinct?null:'PROFILE_IDS_NOT_DISTINCT'};
}

export async function runP1T02F01Verification(options:P1T02RunOptions={}):Promise<P1T02F01RunResult>{
 const live=options.live===true,env=options.env??process.env,providerEnvironment=options.providerEnvironment??'authorized-internal-zernio-test-team';
 if(!live)return {liveEnabled:false,identityRun:null,identity:null,profileA:null,profileB:null,distinctProfileIds:null,result:'BLOCKED',errorCategory:'LIVE_OPT_IN_REQUIRED'};
 const transport=options.transport??(env.ZERNIO_API_KEY?createZernioLiveTransport(env.ZERNIO_API_KEY):undefined);const identityBox:{value:P1T02IdentityOutcome|null}={value:null};
 const identityRun=await runProviderSpikeCase(createP1T02TeamPreflightCase('live',env.ZERNIO_EXPECTED_USER_EMAIL,providerEnvironment,value=>{identityBox.value=value;}),{env,...(transport?{transport}:{}),redactionSecrets:redactionSecrets(env)});
 if(identityRun.evidence.result!=='PASS')return {liveEnabled:true,identityRun,identity:identityBox.value,profileA:null,profileB:null,distinctProfileIds:null,result:'BLOCKED',errorCategory:identityRun.evidence.error_category};
 const aBox:{value:P1T02F01ProfileOutcome|null}={value:null};const aRun=await runProviderSpikeCase(createP1T02F01ProfileReadCase(PROFILE_A,PROFILE_A_RECORDED_ID,providerEnvironment,value=>{aBox.value=value;}),{env,transport:transport!,redactionSecrets:redactionSecrets(env)});const profileA={run:aRun,outcome:aBox.value};
 if(aRun.evidence.result!=='PASS')return {liveEnabled:true,identityRun,identity:identityBox.value,profileA,profileB:null,distinctProfileIds:null,result:'BLOCKED',errorCategory:aRun.evidence.error_category};
 const bBox:{value:P1T02F01ProfileOutcome|null}={value:null};const bRun=await runProviderSpikeCase(createP1T02F01ProfileReadCase(PROFILE_B,PROFILE_B_RECORDED_ID,providerEnvironment,value=>{bBox.value=value;}),{env,transport:transport!,redactionSecrets:redactionSecrets(env)});const profileB={run:bRun,outcome:bBox.value};
 if(bRun.evidence.result!=='PASS')return {liveEnabled:true,identityRun,identity:identityBox.value,profileA,profileB,distinctProfileIds:null,result:'BLOCKED',errorCategory:bRun.evidence.error_category};
 const idA=aBox.value?.observedProfileId,idB=bBox.value?.observedProfileId,distinct=Boolean(idA&&idB&&idA!==idB);if(!distinct)return {liveEnabled:true,identityRun,identity:identityBox.value,profileA,profileB,distinctProfileIds:false,result:'BLOCKED',errorCategory:'PROFILE_IDS_NOT_DISTINCT'};
 return {liveEnabled:true,identityRun,identity:identityBox.value,profileA,profileB,distinctProfileIds:true,result:'PASS',errorCategory:null};
}

export const P1_T02_PROFILE_A=PROFILE_A;
export const P1_T02_PROFILE_B=PROFILE_B;
export const P1_T02_PROFILE_A_RECORDED_ID=PROFILE_A_RECORDED_ID;
export const P1_T02_PROFILE_B_RECORDED_ID=PROFILE_B_RECORDED_ID;
