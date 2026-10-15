import { randomBytes, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { probeP1T08VpsReceiverHttps, startP1T08Receiver } from './p1-t08-receiver.js';
import { P1_T08_F10_ACCOUNT_ID, P1_T08_F10_MAX_OBSERVATION_MS, P1_T08_F10_PLATFORM, P1_T08_F10_PROFILE_ID, runP1T08F10, runP1T08F10PostCleanup, validateP1T08F10Precheck } from './p1-t08-f10-zernio.js';

const live=process.argv.includes('--live'),cleanupOnly=process.argv.includes('--cleanup-post');
if(live&&existsSync('.env')&&(!process.env.ZERNIO_API_KEY||!process.env.ZERNIO_EXPECTED_USER_EMAIL))loadEnvFile('.env');
function arg(name:string){const p=`--${name}=`;return process.argv.find(v=>v.startsWith(p))?.slice(p.length);}
function safeUrl(raw:string|undefined){if(!raw)return null;try{const u=new URL(raw);return u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash?u:null;}catch{return null;}}
function safePort(raw:string|undefined){const n=Number(raw);return Number.isInteger(n)&&n>=1024&&n<=65535?n:null;}
const base={liveEnabled:live,result:'BLOCKED',errorCategory:'LIVE_OPT_IN_REQUIRED',providerCalls:0};
if(!live){console.log(JSON.stringify(base,null,2));process.exitCode=2;}
else if(cleanupOnly){
 const cleanupPostId=arg('post-id')??process.env.P1_T08_F10_CLEANUP_POST_ID;const result=await runP1T08F10PostCleanup(cleanupPostId?{live:true,env:process.env,postId:cleanupPostId}:{live:true,env:process.env});
 console.log(JSON.stringify({...result,mode:'cleanup-only'},null,2));process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;
}
else{
 const precheck=validateP1T08F10Precheck(process.env);
 if(precheck){console.log(JSON.stringify({...base,errorCategory:precheck},null,2));process.exitCode=precheck.startsWith('CRITICAL_')?1:2;}
 else{
  const url=safeUrl(arg('url')??process.env.ZERNIO_P1_T08_F10_PUBLIC_HTTPS_URL),port=safePort(arg('listen-port')??process.env.ZERNIO_P1_T08_F10_LISTEN_PORT);
  if(!url||!port){console.log(JSON.stringify({...base,errorCategory:'CONTROLLED_WEBHOOK_RECEIVER_NOT_AVAILABLE'},null,2));process.exitCode=2;}
  else{
   const runTag=randomUUID().replace(/-/g,'').slice(0,20),secret=randomBytes(32).toString('hex'),marker=`p1-t08-f10-${runTag}`;
   const receiver=await startP1T08Receiver({secret,expectedProfileId:P1_T08_F10_PROFILE_ID,expectedAccountId:P1_T08_F10_ACCOUNT_ID,expectedPlatform:P1_T08_F10_PLATFORM,host:'127.0.0.1',port,path:url.pathname,readinessMarker:marker});
   try{
    const readiness=await probeP1T08VpsReceiverHttps(url.toString(),marker,{timeoutMs:5000});
    if(!readiness.ready){console.log(JSON.stringify({...base,errorCategory:'CONTROLLED_WEBHOOK_RECEIVER_NOT_AVAILABLE',readiness},null,2));process.exitCode=2;}
    else{
     const result=await runP1T08F10({live:true,env:process.env,receiver,receiverUrl:url.toString(),webhookSecret:secret,runTag,observationWindowMs:P1_T08_F10_MAX_OBSERVATION_MS});
     console.log(JSON.stringify({...result,readiness,receiver:{type:'project-vps+nginx+ssh-reverse-tunnel+node',controlledByProject:true,hostname:url.hostname,path:url.pathname,listenPort:port,stoppedAfterRun:true}},null,2));
     process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;
    }
   }catch(error){console.log(JSON.stringify({...base,errorCategory:error instanceof Error?error.message:'P1_T08_F10_RUNNER_FAILED'},null,2));process.exitCode=2;}
   finally{await receiver.close();}
  }
 }
}
