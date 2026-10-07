import { probeP1T05VpsReceiverHttps } from './p1-t05-receiver.js';
function arg(name:string){const p=`--${name}=`;return process.argv.find(x=>x.startsWith(p))?.slice(p.length);}
const url=arg('url')??process.env.ZERNIO_P1_T05_F02_PUBLIC_HTTPS_URL,marker=arg('marker')??process.env.ZERNIO_P1_T05_F02_READINESS_MARKER;
if(!url||!marker){console.log(JSON.stringify({ready:false,errorCategory:'CONTROLLED_VPS_WEBHOOK_RECEIVER_NOT_AVAILABLE'},null,2));process.exitCode=2;}else{const result=await probeP1T05VpsReceiverHttps(url,marker,{timeoutMs:5000});console.log(JSON.stringify(result,null,2));process.exitCode=result.ready?0:2;}
