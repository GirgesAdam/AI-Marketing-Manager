import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import {
  P1_T04_ACCOUNT_ID,
  P1_T04_PROFILE_ID,
  runAfterP1T05ReceiverReadiness,
  runP1T05,
  type P1T05ReceiverController,
  type ProviderTransport,
  type ProviderTransportRequest,
  type ProviderTransportResponse,
} from '../../src/provider-spike/index.js';

const CONTROL='P1T05F01_CONTROL_SENTINEL', SECRET='P1T05F01_WEBHOOK_SECRET_SENTINEL', EMAIL='p1t05f01@example.invalid';
const RECEIVER_URL='https://receiver.example.invalid/zernio', RUN='f01-test';
const env={ZERNIO_API_KEY:CONTROL,ZERNIO_EXPECTED_USER_EMAIL:EMAIL};
function rsp(status:number,body:unknown={},id='req'):ProviderTransportResponse{return{status,headers:{'x-request-id':id},body};}
const receiver:P1T05ReceiverController={port:1,localUrl:'http://127.0.0.1:1/zernio',snapshot:()=>({deliveries:[],testDeliveries:0,realDeliveries:0,logicalUniqueRealEvents:0,foreignProfileObserved:false,profileAttributionUnconfirmed:false}),waitForTest:async()=>null,waitForReal:async()=>[],close:async()=>{}};

type ScenarioOptions={logs?:unknown[];logsStatus?:number;testStatus?:number};
function scenario(options:ScenarioOptions={}){
  const requests:ProviderTransportRequest[]=[];let webhook=true;
  const webhookName=`aimm-p1-t05-webhook-${RUN}`;
  const transport:ProviderTransport={kind:'live',send:vi.fn(async r=>{
    requests.push(r);
    if(r.method==='GET'&&r.url==='/v1/auth/verify')return rsp(200,{valid:true,email:EMAIL},'identity');
    if(r.method==='POST'&&r.url==='/v1/webhooks/settings'){const b=r.body as any;return rsp(200,{webhook:{_id:'wh-f01',name:b.name,url:b.url,events:b.events,isActive:true,profileIds:b.profileIds}},'wh-create');}
    if(r.method==='GET'&&r.url==='/v1/webhooks/settings')return rsp(200,{webhooks:webhook?[{_id:'wh-f01',name:webhookName,url:RECEIVER_URL,events:['post.scheduled'],isActive:true,profileIds:[P1_T04_PROFILE_ID]}]:[]},'wh-list');
    if(r.method==='POST'&&r.url==='/v1/webhooks/test')return rsp(options.testStatus??500,{error:'test failed'},'wh-test-fail');
    if(r.method==='GET'&&r.url?.startsWith('/v1/webhooks/logs?'))return rsp(options.logsStatus??200,{logs:options.logs??[]},'wh-test-logs');
    if(r.method==='DELETE'&&r.url?.startsWith('/v1/webhooks/settings?webhookId=')){webhook=false;return rsp(200,{success:true},'wh-delete');}
    throw new Error(`unexpected ${r.method} ${r.url}`);
  })};
  return{transport,requests,get webhookPresent(){return webhook}};
}
async function runFailure(options:ScenarioOptions={}){const s=scenario(options);const result=await runP1T05({live:true,env,controlTransport:s.transport,receiver,receiverUrl:RECEIVER_URL,webhookSecret:SECRET,runTag:RUN});return{result,s};}
function matching(over:Record<string,unknown>={}){return{webhookId:'wh-f01',event:'webhook.test',attemptNumber:1,status:'failed',createdAt:'2026-10-07T18:02:02Z',...over};}

describe('P1-T05-F01 webhook.test failure diagnostics regressions',()=>{
  it('F01-T01 webhook.test failure queries logs before webhook deletion and cleanup read-back',async()=>{const {s}=await runFailure({logs:[]});const ops=s.requests.map(r=>`${r.method} ${r.url}`);const t=ops.findIndex(x=>x==='POST /v1/webhooks/test'),l=ops.findIndex(x=>x.startsWith('GET /v1/webhooks/logs?')),d=ops.findIndex(x=>x.startsWith('DELETE /v1/webhooks/settings?webhookId=')),reads=ops.map((x,i)=>x==='GET /v1/webhooks/settings'?i:-1).filter(i=>i>=0);expect(t).toBeGreaterThan(-1);expect(l).toBeGreaterThan(t);expect(d).toBeGreaterThan(l);expect(reads.at(-1)).toBeGreaterThan(d);});
  it('F01-T02 webhook.test failure never triggers a second webhook.test POST',async()=>{const {s}=await runFailure({logs:[]});expect(s.requests.filter(r=>r.method==='POST'&&r.url==='/v1/webhooks/test')).toHaveLength(1);});
  it('F01-T03 failure log query is narrowly scoped and unrelated logs are ignored',async()=>{const logs=[matching({statusCode:401}),{...matching({statusCode:500}),webhookId:'foreign-wh'},{...matching({statusCode:500}),event:'post.scheduled'}];const {result,s}=await runFailure({logs});const q=s.requests.find(r=>r.method==='GET'&&r.url?.startsWith('/v1/webhooks/logs?'))!;expect(q.url).toContain('webhookId=wh-f01');expect(q.url).toContain('event=webhook.test');expect(q.url).toContain('limit=5');expect(result.testFailureDiagnostics?.matchingAttemptCount).toBe(1);expect(result.testFailureDiagnostics?.attempts).toHaveLength(1);});
  it('F01-T04 endpoint non-2xx log evidence is preserved safely and classified precisely',async()=>{const {result}=await runFailure({logs:[matching({statusCode:401,errorCategory:'endpoint_rejected',message:'receiver returned 401'})]});expect(result.result).toBe('FAIL');expect(result.errorCategory).toBe('WEBHOOK_TEST_ENDPOINT_NON_2XX');expect(result.testFailureDiagnostics).toMatchObject({providerTestStatus:500,providerTestRequestId:'wh-test-fail',logQueryStatus:200,logQueryRequestId:'wh-test-logs',matchingAttemptCount:1});expect(result.testFailureDiagnostics?.attempts[0]).toMatchObject({attemptNumber:1,deliveryStatus:'failed',endpointResponseStatus:401,deliveryTimestamp:'2026-10-07T18:02:02Z',safeErrorCategory:'endpoint_rejected',safeErrorMessage:'receiver returned 401'});});
  it('F01-T05 connection or timeout evidence produces WEBHOOK_TEST_DELIVERY_PATH_UNRESOLVED',async()=>{const {result}=await runFailure({logs:[matching({errorCategory:'connection_timeout',message:'Connection timed out'})]});expect(result.result).toBe('BLOCKED');expect(result.errorCategory).toBe('WEBHOOK_TEST_DELIVERY_PATH_UNRESOLVED');});
  it('F01-T06 no matching log entry produces WEBHOOK_TEST_DELIVERY_PATH_UNRESOLVED',async()=>{const {result}=await runFailure({logs:[{...matching({statusCode:500}),webhookId:'unrelated'}]});expect(result.result).toBe('BLOCKED');expect(result.errorCategory).toBe('WEBHOOK_TEST_DELIVERY_PATH_UNRESOLVED');expect(result.testFailureDiagnostics?.matchingAttemptCount).toBe(0);});
  it('F01-T07 unavailable failure-log API produces WEBHOOK_TEST_FAILURE_DIAGNOSTICS_UNAVAILABLE',async()=>{const {result}=await runFailure({logsStatus:503});expect(result.result).toBe('BLOCKED');expect(result.errorCategory).toBe('WEBHOOK_TEST_FAILURE_DIAGNOSTICS_UNAVAILABLE');expect(result.testFailureDiagnostics?.logQueryStatus).toBe(503);});
  it('F01-T08 webhook cleanup still executes and is read-back verified after diagnostics',async()=>{const {result,s}=await runFailure({logs:[]});expect(result.webhook?.cleanupConfirmed).toBe(true);expect(s.webhookPresent).toBe(false);expect(s.requests.some(r=>r.method==='DELETE'&&r.url?.includes('webhookId=wh-f01'))).toBe(true);});
  it('F01-T09 webhook secret API key and expected identity never appear in diagnostic output',async()=>{const poisoned=`${SECRET} ${CONTROL} ${EMAIL}`;const {result}=await runFailure({logs:[matching({statusCode:401,errorCategory:poisoned,message:poisoned})]});const serialized=JSON.stringify(result);expect(serialized).not.toContain(SECRET);expect(serialized).not.toContain(CONTROL);expect(serialized).not.toContain(EMAIL);expect(serialized).toContain('[REDACTED]');});
  it('F01-T10 exact-live-URL readiness must pass before provider callback executes',async()=>{const fetcher=vi.fn().mockResolvedValueOnce(new Response('',{status:530})).mockResolvedValueOnce(new Response('',{status:401}));const provider=vi.fn(async()=>{expect(fetcher).toHaveBeenCalledTimes(2);return 'ran';});const gated=await runAfterP1T05ReceiverReadiness(RECEIVER_URL,provider,{attempts:2,sleep:async()=>{},fetcher});expect(gated).toEqual({ready:true,value:'ran'});expect(provider).toHaveBeenCalledTimes(1);});
  it('F01-T11 failed exact-live-URL readiness performs zero provider callbacks',async()=>{const fetcher=vi.fn().mockResolvedValue(new Response('',{status:502})),provider=vi.fn(async()=>true);const gated=await runAfterP1T05ReceiverReadiness(RECEIVER_URL,provider,{attempts:2,sleep:async()=>{},fetcher});expect(gated).toEqual({ready:false,value:null});expect(provider).not.toHaveBeenCalled();});
  it('F01-T12 accepted parent P1-T05 regression inventory remains 46 tests',()=>{const text=readFileSync(new URL('./p1-t05.test.ts',import.meta.url),'utf8');expect((text.match(/\bit\('/g)??[])).toHaveLength(46);});
  it('F01-T13 full-suite gate remains the unfiltered npm test command',()=>{const pkg=JSON.parse(readFileSync(new URL('../../package.json',import.meta.url),'utf8')) as {scripts?:Record<string,string>};expect(pkg.scripts?.test).toBe('vitest run --reporter=verbose');});
});
