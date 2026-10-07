import { randomBytes, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { P1_T04_ACCOUNT_ID, P1_T04_PROFILE_ID } from './p1-t04-zernio.js';
import { runAfterP1T05ExternalReceiverReadiness, startP1T05Receiver } from './p1-t05-receiver.js';
import { runP1T05 } from './p1-t05-zernio.js';

const live=process.argv.includes('--live');
if(live&&existsSync('.env')&&(!process.env.ZERNIO_API_KEY||!process.env.ZERNIO_EXPECTED_USER_EMAIL))loadEnvFile('.env');
function arg(name:string){const p=`--${name}=`;return process.argv.find(x=>x.startsWith(p))?.slice(p.length);}
function safeUrl(raw:string|undefined){if(!raw)return null;try{const u=new globalThis.URL(raw);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash)return null;return u;}catch{return null;}}
function safePort(raw:string|undefined){const n=Number(raw);return Number.isInteger(n)&&n>=1024&&n<=65535?n:null;}
const safeBase={liveEnabled:live,result:'BLOCKED',errorCategory:'LIVE_OPT_IN_REQUIRED'};
if(!live){console.log(JSON.stringify(safeBase,null,2));process.exitCode=2;}else{
 const url=safeUrl(arg('url')??process.env.ZERNIO_P1_T05_F02_PUBLIC_HTTPS_URL),port=safePort(arg('listen-port')??process.env.ZERNIO_P1_T05_F02_LISTEN_PORT);
 if(!url||!port){console.log(JSON.stringify({...safeBase,errorCategory:'CONTROLLED_VPS_WEBHOOK_RECEIVER_NOT_AVAILABLE'},null,2));process.exitCode=2;}else{
  const runTag=randomUUID().replace(/-/g,'').slice(0,24),secret=randomBytes(32).toString('hex'),readinessMarker=`p1-t05-f02-${runTag}`;
  const receiver=await startP1T05Receiver({secret,expectedProfileId:P1_T04_PROFILE_ID,expectedAccountId:P1_T04_ACCOUNT_ID,expectedContentMarker:`P1-T05-${runTag}`,host:'127.0.0.1',port,path:url.pathname,readinessMarker});
  try{
   console.log(JSON.stringify({phase:'AWAITING_EXTERNAL_READINESS',controlledByProject:true,transport:'project-vps-https-reverse-proxy',hostname:url.hostname,path:url.pathname,listenPort:port,readinessMarker,expectedUnsignedStatus:401},null,2));
   const gated=await runAfterP1T05ExternalReceiverReadiness(receiver,()=>runP1T05({live:true,env:process.env,providerEnvironment:'authorized-internal-zernio-test-team',receiver,receiverUrl:url.toString(),webhookSecret:secret,runTag}),{timeoutMs:60000,baselineHits:0});
   if(!gated.ready||!gated.value){console.log(JSON.stringify({...safeBase,errorCategory:'CONTROLLED_VPS_WEBHOOK_RECEIVER_NOT_AVAILABLE',receiver:{type:'project-vps+caddy+node',controlledByProject:true,hostname:url.hostname,path:url.pathname,readinessHits:gated.readinessHits}},null,2));process.exitCode=2;}else{const result=gated.value;const safe={...result,preflight:result.preflight?{runId:result.preflight.evidence.run_id,timestamp:result.preflight.evidence.timestamp,result:result.preflight.evidence.result,status:result.preflight.evidence.provider_status,requestId:result.preflight.evidence.provider_request_id,latencyMs:result.preflight.evidence.latency_ms}:null,receiver:{type:'project-vps+caddy+node',controlledByProject:true,hostname:url.hostname,path:url.pathname,readinessHits:gated.readinessHits,genericThirdPartyRequestBinUsed:false,stoppedAfterCleanup:true}};console.log(JSON.stringify(safe,null,2));process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;}
  }catch(e){console.log(JSON.stringify({...safeBase,errorCategory:e instanceof Error?e.message:'CONTROLLED_VPS_WEBHOOK_RECEIVER_NOT_AVAILABLE'},null,2));process.exitCode=2;}finally{await receiver.close();}
 }
}
