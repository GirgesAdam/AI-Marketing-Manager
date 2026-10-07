import { randomUUID } from 'node:crypto';
import { blockProviderSpike, runProviderSpikeCase } from './harness.js';
import type { ProviderSpikeRunResult, ProviderSpikeTestCase, ProviderTransport, ProviderTransportRequest, ProviderTransportResponse } from './types.js';

const API_BASE='https://zernio.com/api';
const PROFILE_A={testId:'P1-T02-PROFILE-A',name:'aimm-p1-t02-profile-a',description:'AI Marketing Manager Phase 1 provider test — Profile A — P1-T02'} as const;
const PROFILE_B={testId:'P1-T02-PROFILE-B',name:'aimm-p1-t02-profile-b',description:'AI Marketing Manager Phase 1 provider test — Profile B — P1-T02'} as const;
const SAFE_HEADERS=['content-type','retry-after','x-request-id','x-correlation-id','x-ratelimit-limit','x-ratelimit-remaining','x-ratelimit-reset'] as const;

type JsonObject=Record<string,unknown>;
export interface P1T02ProfileOutcome{expectedProfileName:string;profileId:string|null;createdThisRun:boolean;reconciledExisting:boolean;reconciledAfterUncertainCreate:boolean;httpStatuses:number[];providerRequestIds:string[];}
export interface P1T02ProfileRun{run:ProviderSpikeRunResult;outcome:P1T02ProfileOutcome|null;}
export interface P1T02RunResult{liveEnabled:boolean;preflight:ProviderSpikeRunResult|null;profileA:P1T02ProfileRun|null;profileB:P1T02ProfileRun|null;distinctProfileIds:boolean|null;result:'PASS'|'FAIL'|'BLOCKED';errorCategory:string|null;}
export interface P1T02RunOptions{live?:boolean;env?:NodeJS.ProcessEnv;transport?:ProviderTransport;providerEnvironment?:string;}

function obj(value:unknown):JsonObject|null{return typeof value==='object'&&value!==null&&!Array.isArray(value)?value as JsonObject:null;}
function header(response:ProviderTransportResponse,name:string){const target=name.toLowerCase();for(const [key,value] of Object.entries(response.headers??{}))if(key.toLowerCase()===target&&value)return value;return undefined;}
function requestId(response:ProviderTransportResponse){return header(response,'x-request-id')??header(response,'x-correlation-id');}
function numericStatus(response:ProviderTransportResponse){return typeof response.status==='number'?response.status:null;}
function category(error:unknown){return obj(error)?.category as string|undefined;}
function profileId(profile:JsonObject){const value=profile._id??profile.id;return typeof value==='string'&&value.length>0?value:null;}
function profileName(profile:JsonObject){return typeof profile.name==='string'?profile.name:null;}
function exactProfiles(body:unknown,name:string){const root=obj(body);if(!root||!Array.isArray(root.profiles))blockProviderSpike('MALFORMED_PROVIDER_RESPONSE','Profile list response is missing profiles array.');return root.profiles.map(obj).filter((p):p is JsonObject=>Boolean(p)).filter(p=>profileName(p)===name);}
function assertReadableProfile(body:unknown,name:string){const matches=exactProfiles(body,name);if(matches.length>1)blockProviderSpike('AMBIGUOUS_PROFILE_STATE','Exact-name lookup returned multiple Profiles.');if(matches.length===0)return null;const id=profileId(matches[0]!);if(!id)blockProviderSpike('MALFORMED_PROVIDER_RESPONSE','Resolved Profile is missing provider ID.');return {id,name};}
function blockReadStatus(response:ProviderTransportResponse,operation:string){const status=numericStatus(response);if(status===401||status===403)blockProviderSpike('PROVIDER_AUTHORIZATION_BLOCKED',`${operation} was not authorized.`);if(status===429)blockProviderSpike('HTTP_429',`${operation} was rate limited.`);if(status!==null&&status>=500)blockProviderSpike('PROVIDER_5XX_BLOCKED',`${operation} returned provider 5xx.`);if(status!==200)blockProviderSpike('PROVIDER_HTTP_BLOCKED',`${operation} returned unexpected status ${String(response.status)}.`);}
function isUncertainWriteError(error:unknown){const c=category(error);return c==='TIMEOUT'||c==='NETWORK_ERROR';}

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

export function createP1T02TeamPreflightCase(mode:'offline'|'live',providerEnvironment='zernio-test-team'):ProviderSpikeTestCase{
 return {testId:'P1-T02-AUTH-PREFLIGHT',...commonCase(mode,providerEnvironment),maxRequests:1,execute:async context=>{
  if(mode==='offline')return {ok:true,offline:true};
  const response=await context.request({method:'GET',url:'/v1/users',safeMetadata:{path:'/v1/users',purpose:'authorized-team-preflight'}});blockReadStatus(response,'Authorized-team preflight');
  const body=obj(response.body);const currentUserId=body?.currentUserId;const users=body?.users;if(typeof currentUserId!=='string'||!Array.isArray(users))blockProviderSpike('MALFORMED_PROVIDER_RESPONSE','Authorized-team preflight response shape was not recognized.');
  return {ok:true,currentUserIdPresent:true,teamUserCount:users.length};
 },assert:async observation=>Boolean(obj(observation)?.ok)};
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

export async function runP1T02Profiles(options:P1T02RunOptions={}):Promise<P1T02RunResult>{
 const live=options.live===true,mode=live?'live':'offline',env=options.env??process.env,providerEnvironment=options.providerEnvironment??'zernio-test-team';
 if(!live)return {liveEnabled:false,preflight:null,profileA:null,profileB:null,distinctProfileIds:null,result:'BLOCKED',errorCategory:'LIVE_OPT_IN_REQUIRED'};
 const transport=options.transport??(env.ZERNIO_API_KEY?createZernioLiveTransport(env.ZERNIO_API_KEY):undefined);
 const preflight=await runProviderSpikeCase(createP1T02TeamPreflightCase(mode,providerEnvironment),{env,...(transport?{transport}:{})});
 if(preflight.evidence.result!=='PASS')return {liveEnabled:true,preflight,profileA:null,profileB:null,distinctProfileIds:null,result:'BLOCKED',errorCategory:preflight.evidence.error_category};
 const outcomeA:{value:P1T02ProfileOutcome|null}={value:null};const runA=await runProviderSpikeCase(createP1T02ProfileCase(PROFILE_A,mode,providerEnvironment,value=>{outcomeA.value=value;}),{env,transport:transport!});const profileA={run:runA,outcome:outcomeA.value};
 if(runA.evidence.result!=='PASS')return {liveEnabled:true,preflight,profileA,profileB:null,distinctProfileIds:null,result:runA.evidence.result,errorCategory:runA.evidence.error_category};
 const outcomeB:{value:P1T02ProfileOutcome|null}={value:null};const runB=await runProviderSpikeCase(createP1T02ProfileCase(PROFILE_B,mode,providerEnvironment,value=>{outcomeB.value=value;}),{env,transport:transport!});const profileB={run:runB,outcome:outcomeB.value};
 if(runB.evidence.result!=='PASS')return {liveEnabled:true,preflight,profileA,profileB,distinctProfileIds:null,result:runB.evidence.result,errorCategory:runB.evidence.error_category};
 const idA=outcomeA.value?.profileId,idB=outcomeB.value?.profileId;const distinct=Boolean(idA&&idB&&idA!==idB);return {liveEnabled:true,preflight,profileA,profileB,distinctProfileIds:distinct,result:distinct?'PASS':'FAIL',errorCategory:distinct?null:'PROFILE_IDS_NOT_DISTINCT'};
}

export const P1_T02_PROFILE_A=PROFILE_A;
export const P1_T02_PROFILE_B=PROFILE_B;
