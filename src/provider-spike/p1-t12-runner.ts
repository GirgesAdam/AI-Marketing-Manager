import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const P1_T12_FILENAME='marketlyai-p1-t12-fixture.png';
export const P1_T12_CONTENT_TYPE='image/png';
export const P1_T12_BASE64='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
export const P1_T12_EXPECTED_SIZE=68;
export const P1_T12_EXPECTED_SHA256='431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460';
export const P1_T12_ZERNIO_MAX=2;
export const P1_T12_CLOUD_PUT_MAX=2;
export const P1_T12_PUBLIC_GET_MAX=2;
export const P1_T12_NETWORK_MAX=6;
export const P1_T12_EXPIRY_MARGIN_MS=60_000;
const API_BASE='https://zernio.com/api';

type Result='PASS'|'BLOCKED'|'FAIL';
export type P1T12Classification='TEMP_MEDIA_PRESIGN_UPLOAD_PUBLIC_READ_AND_UPLOAD_URL_EXPIRY_VERIFIED'|'TEMP_MEDIA_UPLOAD_BLOCKED'|'PRESIGNED_UPLOAD_EXPIRY_NOT_ENFORCED_AS_EXPECTED'|'MEDIA_PROVIDER_BEHAVIOR_BLOCKED'|'MEDIA_SAFETY_FAILURE';
type FetchLike=(input:string|URL|Request,init?:RequestInit)=>Promise<Response>;
type SleepLike=(ms:number)=>Promise<void>;
type JsonObject=Record<string,unknown>;

export interface P1T12RunOptions{live?:boolean;env?:NodeJS.ProcessEnv;fetchImpl?:FetchLike;now?:()=>number;sleep?:SleepLike;}
export interface P1T12RunResult{
 liveEnabled:boolean;result:Result;classification:P1T12Classification;errorCategory:string|null;recommendation:'Media Upload → PARTIALLY_VERIFIED — PRESIGN/UPLOAD/PUBLIC READ/UPLOAD-URL EXPIRY VERIFIED — AWAITING TEAM LEADER REVIEW'|'Media Upload remains SPIKE_PENDING';
 asset:{filename:string;contentType:string;size:number;sha256:string;valid:boolean};identityMatch:boolean;
 presign:{status:number|null;requestId:string|null;expiresIn:number|null;key:string|null;keyPrefix:string|null;uploadScheme:string|null;uploadHost:string|null;uploadPathPrefix:string|null;uploadSignedQueryPresent:boolean;publicScheme:string|null;publicHost:string|null;publicPath:string|null;issuedAt:string|null};
 initialUpload:{status:number|null;responseLength:number|null};publicRead:{status:number|null;size:number|null;sha256:string|null;match:boolean};expiry:{elapsedMs:number|null;deadlineReached:boolean;status:number|null;safeErrorCategory:string|null;rejected:boolean};
 zernioApiRequests:number;cloudPutRequests:number;publicGetRequests:number;networkRequests:number;providerSocialMutations:0;posts:0;dms:0;comments:0;ads:0;webhookMutations:0;permanentUploads:0;signedUrlsPersisted:0;secretsPersisted:0;automaticRetries:0;
}

function obj(v:unknown):JsonObject|null{return typeof v==='object'&&v!==null&&!Array.isArray(v)?v as JsonObject:null;}
function text(v:unknown){return typeof v==='string'&&v.length>0?v:null;}
function finitePositive(v:unknown){return typeof v==='number'&&Number.isFinite(v)&&v>0?v:null;}
function sha256(bytes:Uint8Array){return createHash('sha256').update(bytes).digest('hex');}
function requestId(r:Response){return r.headers.get('x-request-id')??r.headers.get('x-correlation-id');}
function is2xx(status:number){return status>=200&&status<300;}
function waitDefault(ms:number){return new Promise<void>(resolve=>setTimeout(resolve,ms));}
function keyPrefix(key:string){const parts=key.split('/').filter(Boolean);return parts.length?`${parts[0]}/`:null;}
function pathPrefix(pathname:string){const parts=pathname.split('/').filter(Boolean);return parts.length?`/${parts[0]}/`:null;}
function normalizePresign(body:unknown){const root=obj(body),data=obj(root?.data)??root;return data;}
function safeExpiryCategory(status:number,body:string){if(is2xx(status))return null;const lower=body.toLowerCase();if(lower.includes('expired')||lower.includes('requestexpired')||lower.includes('request has expired'))return'EXPIRED_SIGNED_REQUEST';if(lower.includes('signaturedoesnotmatch')||lower.includes('invalidsignature')||lower.includes('authorizationqueryparameterserror')||lower.includes('invalid signature'))return'SIGNED_REQUEST_INVALID';return null;}

export function p1T12Fixture(){const bytes=Buffer.from(P1_T12_BASE64,'base64');return{bytes,size:bytes.length,sha256:sha256(bytes)};}
export function parseP1T12Args(argv:string[]){if(argv.length===0)return{ok:true as const,live:false};if(argv.length===1&&argv[0]==='--live')return{ok:true as const,live:true};return{ok:false as const,live:false};}

export async function runP1T12(options:P1T12RunOptions={}):Promise<P1T12RunResult>{
 const live=options.live===true,env=options.env??process.env,fetchImpl=options.fetchImpl??fetch,now=options.now??Date.now,sleep=options.sleep??waitDefault,fixture=p1T12Fixture();
 let zernioApiRequests=0,cloudPutRequests=0,publicGetRequests=0,networkRequests=0,identityMatch=false;
 const presign:P1T12RunResult['presign']={status:null,requestId:null,expiresIn:null,key:null,keyPrefix:null,uploadScheme:null,uploadHost:null,uploadPathPrefix:null,uploadSignedQueryPresent:false,publicScheme:null,publicHost:null,publicPath:null,issuedAt:null};
 const initialUpload:P1T12RunResult['initialUpload']={status:null,responseLength:null};const publicRead:P1T12RunResult['publicRead']={status:null,size:null,sha256:null,match:false};const expiry:P1T12RunResult['expiry']={elapsedMs:null,deadlineReached:false,status:null,safeErrorCategory:null,rejected:false};
 const finish=(result:Result,classification:P1T12Classification,errorCategory:string|null):P1T12RunResult=>({liveEnabled:live,result,classification,errorCategory,recommendation:classification==='TEMP_MEDIA_PRESIGN_UPLOAD_PUBLIC_READ_AND_UPLOAD_URL_EXPIRY_VERIFIED'?'Media Upload → PARTIALLY_VERIFIED — PRESIGN/UPLOAD/PUBLIC READ/UPLOAD-URL EXPIRY VERIFIED — AWAITING TEAM LEADER REVIEW':'Media Upload remains SPIKE_PENDING',asset:{filename:P1_T12_FILENAME,contentType:P1_T12_CONTENT_TYPE,size:fixture.size,sha256:fixture.sha256,valid:fixture.size===P1_T12_EXPECTED_SIZE&&fixture.sha256===P1_T12_EXPECTED_SHA256},identityMatch,presign,initialUpload,publicRead,expiry,zernioApiRequests,cloudPutRequests,publicGetRequests,networkRequests,providerSocialMutations:0,posts:0,dms:0,comments:0,ads:0,webhookMutations:0,permanentUploads:0,signedUrlsPersisted:0,secretsPersisted:0,automaticRetries:0});
 if(fixture.size!==P1_T12_EXPECTED_SIZE||fixture.sha256!==P1_T12_EXPECTED_SHA256)return finish('FAIL','MEDIA_SAFETY_FAILURE','SAFETY_FIXTURE_MISMATCH');
 if(!live)return finish('BLOCKED','MEDIA_PROVIDER_BEHAVIOR_BLOCKED','LIVE_OPT_IN_REQUIRED');
 const apiKey=env.ZERNIO_API_KEY,expectedEmail=env.ZERNIO_EXPECTED_USER_EMAIL?.trim().toLowerCase();if(!apiKey||!expectedEmail)return finish('BLOCKED','MEDIA_PROVIDER_BEHAVIOR_BLOCKED','MISSING_LIVE_CREDENTIAL_OR_EXPECTED_IDENTITY');
 const zernio=async(path:string,init:RequestInit)=>{if(zernioApiRequests>=P1_T12_ZERNIO_MAX||networkRequests>=P1_T12_NETWORK_MAX)throw new Error('SAFETY_REQUEST_CEILING_VIOLATION');if(path!=='/v1/auth/verify'&&path!=='/v1/media/presign')throw new Error('SAFETY_ENDPOINT_NOT_AUTHORIZED');zernioApiRequests++;networkRequests++;const headers=new Headers(init.headers);headers.set('Authorization',`Bearer ${apiKey}`);headers.set('Accept','application/json');return fetchImpl(`${API_BASE}${path}`,{...init,headers,signal:AbortSignal.timeout(10_000)});};
 const cloudPut=async(url:string)=>{if(cloudPutRequests>=P1_T12_CLOUD_PUT_MAX||networkRequests>=P1_T12_NETWORK_MAX)throw new Error('SAFETY_REQUEST_CEILING_VIOLATION');cloudPutRequests++;networkRequests++;return fetchImpl(url,{method:'PUT',headers:{'Content-Type':P1_T12_CONTENT_TYPE},body:fixture.bytes,signal:AbortSignal.timeout(15_000)});};
 const publicGet=async(url:string)=>{if(publicGetRequests>=P1_T12_PUBLIC_GET_MAX||networkRequests>=P1_T12_NETWORK_MAX)throw new Error('SAFETY_REQUEST_CEILING_VIOLATION');publicGetRequests++;networkRequests++;return fetchImpl(url,{method:'GET',signal:AbortSignal.timeout(15_000)});};
 try{
  const auth=await zernio('/v1/auth/verify',{method:'GET'});if(auth.status!==200)return finish('BLOCKED','MEDIA_PROVIDER_BEHAVIOR_BLOCKED',`IDENTITY_HTTP_${auth.status}`);const authBody=obj(await auth.json());const actual=text(authBody?.email)?.trim().toLowerCase();identityMatch=Boolean(authBody?.valid===true&&actual===expectedEmail);if(!identityMatch)return finish('FAIL','MEDIA_SAFETY_FAILURE','SAFETY_IDENTITY_MISMATCH');
  const pre=await zernio('/v1/media/presign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({filename:P1_T12_FILENAME,contentType:P1_T12_CONTENT_TYPE,size:P1_T12_EXPECTED_SIZE})});presign.status=pre.status;presign.requestId=requestId(pre);if(pre.status!==200)return finish('BLOCKED','MEDIA_PROVIDER_BEHAVIOR_BLOCKED',`PRESIGN_HTTP_${pre.status}`);const issuedMs=now(),data=normalizePresign(await pre.json()),uploadUrl=text(data?.uploadUrl),publicUrl=text(data?.publicUrl),key=text(data?.key),expiresIn=finitePositive(data?.expiresIn);presign.issuedAt=new Date(issuedMs).toISOString();presign.expiresIn=expiresIn;presign.key=key;presign.keyPrefix=key?keyPrefix(key):null;if(!uploadUrl||!publicUrl||!key||!expiresIn)return finish('BLOCKED','MEDIA_PROVIDER_BEHAVIOR_BLOCKED','PRESIGN_RESPONSE_INCOMPLETE');
  let upload:URL,publicU:URL;try{upload=new URL(uploadUrl);publicU=new URL(publicUrl);}catch{return finish('FAIL','MEDIA_SAFETY_FAILURE','SAFETY_UNEXPECTED_PRESIGN_URL');}presign.uploadScheme=upload.protocol;presign.uploadHost=upload.hostname;presign.uploadPathPrefix=pathPrefix(upload.pathname);presign.uploadSignedQueryPresent=[...upload.searchParams.keys()].length>0;presign.publicScheme=publicU.protocol;presign.publicHost=publicU.hostname;presign.publicPath=publicU.pathname;
  const uploadPath=decodeURIComponent(upload.pathname),publicPath=decodeURIComponent(publicU.pathname);if(upload.protocol!=='https:'||publicU.protocol!=='https:'||!upload.hostname.endsWith('.r2.cloudflarestorage.com')||publicU.hostname!=='media.zernio.com'||!presign.uploadSignedQueryPresent||!key.startsWith('temp/')||!key.endsWith(P1_T12_FILENAME)||!uploadPath.endsWith(`/${key}`)||publicPath!==`/${key}`)return finish('FAIL','MEDIA_SAFETY_FAILURE','SAFETY_UNEXPECTED_PRESIGN_TARGET');
  const firstPut=await cloudPut(uploadUrl);initialUpload.status=firstPut.status;const firstText=await firstPut.text();initialUpload.responseLength=Buffer.byteLength(firstText);if(!is2xx(firstPut.status))return finish('BLOCKED','TEMP_MEDIA_UPLOAD_BLOCKED',`INITIAL_PUT_HTTP_${firstPut.status}`);
  const read=await publicGet(publicUrl);publicRead.status=read.status;if(!is2xx(read.status))return finish('BLOCKED','TEMP_MEDIA_UPLOAD_BLOCKED',`PUBLIC_READ_HTTP_${read.status}`);const downloaded=new Uint8Array(await read.arrayBuffer());publicRead.size=downloaded.length;publicRead.sha256=sha256(downloaded);publicRead.match=downloaded.length===P1_T12_EXPECTED_SIZE&&publicRead.sha256===P1_T12_EXPECTED_SHA256;if(!publicRead.match)return finish('BLOCKED','TEMP_MEDIA_UPLOAD_BLOCKED','PUBLIC_BINARY_MISMATCH');
  const deadlineMs=issuedMs+expiresIn*1000+P1_T12_EXPIRY_MARGIN_MS,waitMs=Math.max(0,deadlineMs-now());if(waitMs>0)await sleep(waitMs);expiry.elapsedMs=now()-issuedMs;expiry.deadlineReached=expiry.elapsedMs>=expiresIn*1000+P1_T12_EXPIRY_MARGIN_MS;if(!expiry.deadlineReached)return finish('FAIL','MEDIA_SAFETY_FAILURE','SAFETY_EXPIRY_DEADLINE_NOT_REACHED');
  const expiredPut=await cloudPut(uploadUrl);expiry.status=expiredPut.status;const expiredText=await expiredPut.text();expiry.safeErrorCategory=safeExpiryCategory(expiredPut.status,expiredText);if(is2xx(expiredPut.status))return finish('FAIL','PRESIGNED_UPLOAD_EXPIRY_NOT_ENFORCED_AS_EXPECTED','EXPIRED_PUT_SUCCEEDED');expiry.rejected=expiry.safeErrorCategory!==null;if(!expiry.rejected)return finish('BLOCKED','MEDIA_PROVIDER_BEHAVIOR_BLOCKED','EXPIRED_PUT_REJECTION_AMBIGUOUS');
  return finish('PASS','TEMP_MEDIA_PRESIGN_UPLOAD_PUBLIC_READ_AND_UPLOAD_URL_EXPIRY_VERIFIED',null);
 }catch(error){const message=error instanceof Error?error.message:'UNKNOWN_MEDIA_FAILURE';if(message.startsWith('SAFETY_'))return finish('FAIL','MEDIA_SAFETY_FAILURE',message);return finish('BLOCKED','MEDIA_PROVIDER_BEHAVIOR_BLOCKED',message);}
}

async function main(){const parsed=parseP1T12Args(process.argv.slice(2));if(!parsed.ok){console.log(JSON.stringify({liveEnabled:false,result:'BLOCKED',classification:'MEDIA_PROVIDER_BEHAVIOR_BLOCKED',errorCategory:'INVALID_P1_T12_ARGUMENTS'}));process.exitCode=2;return;}const result=await runP1T12({live:parsed.live,env:process.env});console.log(JSON.stringify(result,null,2));process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
