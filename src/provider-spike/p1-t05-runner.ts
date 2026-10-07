import { randomBytes, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { spawn, type ChildProcess } from 'node:child_process';
import { P1_T04_ACCOUNT_ID, P1_T04_PROFILE_ID } from './p1-t04-zernio.js';
import { startP1T05Receiver } from './p1-t05-receiver.js';
import { runP1T05 } from './p1-t05-zernio.js';

const live=process.argv.includes('--live');
if(live&&existsSync('.env')&&(!process.env.ZERNIO_API_KEY||!process.env.ZERNIO_EXPECTED_USER_EMAIL))loadEnvFile('.env');
async function tunnel(binary:string,localUrl:string){let child:ChildProcess|null=null;try{child=spawn(binary,['tunnel','--url',localUrl,'--no-autoupdate'],{stdio:['ignore','pipe','pipe']});const url=await new Promise<string>((resolve,reject)=>{let buf='';const timer=setTimeout(()=>reject(new Error('CONTROLLED_WEBHOOK_TEST_RECEIVER_NOT_AVAILABLE')),15000);const on=(d:Buffer)=>{buf+=d.toString('utf8');const m=buf.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);if(m){clearTimeout(timer);resolve(`${m[0]}/zernio`);}};child!.stdout!.on('data',on);child!.stderr!.on('data',on);child!.once('exit',code=>{clearTimeout(timer);reject(new Error(`cloudflared exited ${String(code)}`));});});return {child,url};}catch(e){child?.kill();throw e;}}
const safeBase={liveEnabled:live,result:'BLOCKED',errorCategory:'LIVE_OPT_IN_REQUIRED'};
if(!live){console.log(JSON.stringify(safeBase,null,2));process.exitCode=2;}else{
 const binary=process.env.ZERNIO_P1_T05_CLOUDFLARED_PATH;if(!binary||!existsSync(binary)){console.log(JSON.stringify({...safeBase,errorCategory:'CONTROLLED_WEBHOOK_TEST_RECEIVER_NOT_AVAILABLE'},null,2));process.exitCode=2;}else{
  const runTag=randomUUID().replace(/-/g,'').slice(0,24),secret=randomBytes(32).toString('hex'),receiver=await startP1T05Receiver({secret,expectedProfileId:P1_T04_PROFILE_ID,expectedAccountId:P1_T04_ACCOUNT_ID,expectedContentMarker:`P1-T05-${runTag}`});let t:Awaited<ReturnType<typeof tunnel>>|null=null;
  try{t=await tunnel(binary,`http://127.0.0.1:${receiver.port}`);const result=await runP1T05({live:true,env:process.env,providerEnvironment:'authorized-internal-zernio-test-team',receiver,receiverUrl:t.url,webhookSecret:secret,runTag});const safe={...result,preflight:result.preflight?{runId:result.preflight.evidence.run_id,timestamp:result.preflight.evidence.timestamp,result:result.preflight.evidence.result,status:result.preflight.evidence.provider_status,requestId:result.preflight.evidence.provider_request_id,latencyMs:result.preflight.evidence.latency_ms}:null,receiver:{type:'local-node-http+cloudflare-quick-tunnel',controlledByProject:true,publicHttpsUrl:t.url,genericThirdPartyRequestBinUsed:false,stoppedAfterCleanup:true}};console.log(JSON.stringify(safe,null,2));process.exitCode=result.result==='PASS'?0:result.result==='FAIL'?1:2;}catch(e){console.log(JSON.stringify({...safeBase,errorCategory:e instanceof Error?e.message:'CONTROLLED_WEBHOOK_TEST_RECEIVER_NOT_AVAILABLE'},null,2));process.exitCode=2;}finally{t?.child.kill();await receiver.close();}
 }
}
