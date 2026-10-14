import { randomBytes, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { P1_T04_ACCOUNT_ID, P1_T04_PROFILE_ID } from './p1-t04-zernio.js';
import { probeP1T08VpsReceiverHttps, startP1T08Receiver } from './p1-t08-receiver.js';
import { P1_T08_F07_OBSERVATION_WINDOW_MS, P1_T08_F07_PROVIDER_CONTRACT, evaluateP1T08F07StaleGate, runP1T08F07 } from './p1-t08-f07-zernio.js';

const live=process.argv.includes('--live');
if(live&&existsSync('.env')&&(!process.env.ZERNIO_API_KEY||!process.env.ZERNIO_EXPECTED_USER_EMAIL))loadEnvFile('.env');
function arg(name:string){const prefix=`--${name}=`;return process.argv.find(value=>value.startsWith(prefix))?.slice(prefix.length);}
function safeUrl(raw:string|undefined){if(!raw)return null;try{const url=new URL(raw);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)return null;return url;}catch{return null;}}
function safePort(raw:string|undefined){const value=Number(raw);return Number.isInteger(value)&&value>=1024&&value<=65535?value:null;}
const timingGate=evaluateP1T08F07StaleGate();
const safeBase={liveEnabled:live,result:'BLOCKED',errorCategory:'LIVE_OPT_IN_REQUIRED',timingGate,providerContract:P1_T08_F07_PROVIDER_CONTRACT};
if(!live){console.log(JSON.stringify(safeBase,null,2));process.exitCode=2;}
else if(!timingGate.pass){console.log(JSON.stringify({...safeBase,errorCategory:'STALE_WINDOW_TIMING_GATE_NOT_SATISFIED'},null,2));process.exitCode=2;}
else{
 const url=safeUrl(arg('url')??process.env.ZERNIO_P1_T08_F07_PUBLIC_HTTPS_URL),port=safePort(arg('listen-port')??process.env.ZERNIO_P1_T08_F07_LISTEN_PORT);
 if(!url||!port){console.log(JSON.stringify({...safeBase,errorCategory:'CONTROLLED_VPS_WEBHOOK_RECEIVER_NOT_AVAILABLE'},null,2));process.exitCode=2;}
 else{
  const runTag=randomUUID().replace(/-/g,'').slice(0,24),secret=randomBytes(32).toString('hex'),readinessMarker=`p1-t08-f07-${runTag}`;
  const receiver=await startP1T08Receiver({secret,expectedProfileId:P1_T04_PROFILE_ID,expectedAccountId:P1_T04_ACCOUNT_ID,expectedPlatform:'facebook',host:'127.0.0.1',port,path:url.pathname,readinessMarker});
  try{
   console.log(JSON.stringify({phase:'P1_T08_F07_EXTERNAL_READINESS',controlledByProject:true,transport:'project-vps-https-reverse-proxy',hostname:url.hostname,path:url.pathname,listenPort:port,expectedUnsignedStatus:401,observationWindowMs:P1_T08_F07_OBSERVATION_WINDOW_MS,timingGate},null,2));
   const readiness=await probeP1T08VpsReceiverHttps(url.toString(),readinessMarker,{timeoutMs:5000});
   if(!readiness.ready){console.log(JSON.stringify({...safeBase,errorCategory:'CONTROLLED_VPS_WEBHOOK_RECEIVER_NOT_AVAILABLE',readiness},null,2));process.exitCode=2;}
   else{
    const result=await runP1T08F07({live:true,env:process.env,providerEnvironment:'authorized-internal-zernio-test-team',receiver,receiverUrl:url.toString(),receiverReadyAt:readiness.timestamp,webhookSecret:secret,runTag,observationWindowMs:P1_T08_F07_OBSERVATION_WINDOW_MS});
    const safe={...result,providerContract:P1_T08_F07_PROVIDER_CONTRACT,preflight:result.preflight?{runId:result.preflight.evidence.run_id,timestamp:result.preflight.evidence.timestamp,result:result.preflight.evidence.result,status:result.preflight.evidence.provider_status,requestId:result.preflight.evidence.provider_request_id,latencyMs:result.preflight.evidence.latency_ms}:null,readiness,receiver:{type:'project-vps+nginx+ssh-reverse-tunnel+node',controlledByProject:true,hostname:url.hostname,path:url.pathname,listenPort:port,stoppedAfterCleanup:true,genericThirdPartyRequestBinUsed:false}};
    console.log(JSON.stringify(safe,null,2));process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;
   }
  }catch(error){console.log(JSON.stringify({...safeBase,errorCategory:error instanceof Error?error.message:'P1_T08_F07_RUNNER_FAILED'},null,2));process.exitCode=2;}
  finally{await receiver.close();}
 }
}
