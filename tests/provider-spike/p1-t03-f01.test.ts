import { describe, expect, it } from 'vitest';
import { createP1T03KeyCreateCase, P1_T03_KEY_A, runProviderSpikeCase, type ProviderTransport, type ProviderTransportRequest, type ProviderTransportResponse } from '../../src/provider-spike/index.js';

const CONTROL='P1T03F01_CONTROL_SECRET_SENTINEL';
const RAW_KEY='P1T03F01_RAW_SCOPED_KEY_SENTINEL';
const KEY_PREVIEW='P1T03F01_KEY_PREVIEW_SENTINEL';
const SYNTHETIC='aimm-p1-t03-profile-a-readonly-f01-recovery';
const EXPIRES='2026-10-08T12:00:00.000Z';
type Variant='well-formed'|'missing-api-key'|'missing-id'|'missing-key'|'scope-mismatch'|'profile-mismatch'|'permission-mismatch'|'missing-expiry'|'invalid-expiry';
interface FixtureOptions{variant:Variant;matches?:unknown[];deleteStatus?:number;listStatus?:number;listBody?:unknown;}
function response(status:number,body:unknown={},id='f01-request'):ProviderTransportResponse{return {status,headers:{'x-request-id':id},body};}
function exactKey(id='reconciled-key'){return {id,name:SYNTHETIC,keyPreview:KEY_PREVIEW,scope:'profiles',profileIds:[P1_T03_KEY_A.profileId],permission:'read'};}
function fixture(options:FixtureOptions){
 const requests:ProviderTransportRequest[]=[];let posts=0,gets=0,deletes=0;
 const transport:ProviderTransport={kind:'live',send:async request=>{requests.push(request);
  if(request.method==='POST'&&request.url==='/v1/api-keys'){
   posts++;const body=request.body as {name:string};const apiKey:Record<string,unknown>={id:'returned-key',name:body.name,key:RAW_KEY,scope:'profiles',profileIds:[P1_T03_KEY_A.profileId],permission:'read',expiresAt:EXPIRES};
   if(options.variant==='missing-api-key')return response(201,{},'create');
   if(options.variant==='missing-id')delete apiKey.id;
   if(options.variant==='missing-key')delete apiKey.key;
   if(options.variant==='scope-mismatch')apiKey.scope='all';
   if(options.variant==='profile-mismatch')apiKey.profileIds=['foreign-profile-id'];
   if(options.variant==='permission-mismatch')apiKey.permission='write';
   if(options.variant==='missing-expiry')delete apiKey.expiresAt;
   if(options.variant==='invalid-expiry')apiKey.expiresAt='not-a-date';
   return response(201,{apiKey},'create');
  }
  if(request.method==='GET'&&request.url==='/v1/api-keys'){gets++;return response(options.listStatus??200,options.listBody??{apiKeys:options.matches??[exactKey()]},'list');}
  if(request.method==='DELETE'&&request.url?.startsWith('/v1/api-keys/')){deletes++;return response(options.deleteStatus??200,{message:'deleted'},'delete');}
  throw new Error(`unexpected request ${request.method} ${request.url}`);
 }};
 return {transport,requests,get posts(){return posts;},get gets(){return gets;},get deletes(){return deletes;}};
}
async function runFixture(options:FixtureOptions){const f=fixture(options);const test=createP1T03KeyCreateCase(P1_T03_KEY_A,SYNTHETIC);const run=await runProviderSpikeCase(test,{env:{ZERNIO_API_KEY:CONTROL},transport:f.transport,redactionSecrets:[CONTROL,RAW_KEY,KEY_PREVIEW]});return {run,f};}

describe('P1-T03-F01 malformed scoped-key cleanup regressions',()=>{
 it('F01-T01 missing apiKey reconciles exact name, revokes one match, and blocks malformed response',async()=>{const {run,f}=await runFixture({variant:'missing-api-key',matches:[{id:'unrelated',name:'other-key'},exactKey()]});expect(run.evidence.result).toBe('BLOCKED');expect(run.evidence.error_category).toBe('MALFORMED_PROVIDER_RESPONSE');expect([f.posts,f.gets,f.deletes]).toEqual([1,1,1]);expect(f.requests.filter(r=>r.method==='DELETE').map(r=>r.url)).toEqual(['/v1/api-keys/reconciled-key']);});
 it('F01-T02 missing provider key ID reconciles exact synthetic name and revokes without exposing raw key',async()=>{const {run,f}=await runFixture({variant:'missing-id'});expect(run.evidence.result).toBe('BLOCKED');expect(run.evidence.error_category).toBe('MALFORMED_PROVIDER_RESPONSE');expect([f.posts,f.gets,f.deletes]).toEqual([1,1,1]);expect(JSON.stringify(run)).not.toContain(RAW_KEY);});
 it('F01-T03 missing raw key with known provider ID revokes directly without list reconciliation',async()=>{const {run,f}=await runFixture({variant:'missing-key'});expect(run.evidence.result).toBe('BLOCKED');expect(run.evidence.error_category).toBe('MALFORMED_PROVIDER_RESPONSE');expect([f.posts,f.gets,f.deletes]).toEqual([1,0,1]);expect(f.requests.find(r=>r.method==='DELETE')?.url).toBe('/v1/api-keys/returned-key');});
 it('F01-T04 zero exact reconciliation matches returns cleanup-unconfirmed and never retries create',async()=>{const {run,f}=await runFixture({variant:'missing-api-key',matches:[]});expect(run.evidence.error_category).toBe('SCOPED_KEY_CLEANUP_UNCONFIRMED');expect([f.posts,f.gets,f.deletes]).toEqual([1,1,0]);});
 it('F01-T05 multiple exact reconciliation matches block ambiguity and do not delete arbitrarily',async()=>{const {run,f}=await runFixture({variant:'missing-api-key',matches:[exactKey('one'),exactKey('two')]});expect(run.evidence.result).toBe('BLOCKED');expect(run.evidence.error_category).toBe('AMBIGUOUS_SCOPED_KEY_STATE');expect([f.posts,f.gets,f.deletes]).toEqual([1,1,0]);});
 it('F01-T06 reconciled exact match missing provider ID cannot confirm cleanup',async()=>{const {run,f}=await runFixture({variant:'missing-id',matches:[{name:SYNTHETIC,keyPreview:KEY_PREVIEW}]});expect(run.evidence.error_category).toBe('SCOPED_KEY_CLEANUP_UNCONFIRMED');expect([f.posts,f.gets,f.deletes]).toEqual([1,1,0]);});
 it('F01-T07 reconciled exact-match DELETE failure takes precedence as cleanup-unconfirmed',async()=>{const {run,f}=await runFixture({variant:'missing-api-key',deleteStatus:500});expect(run.evidence.error_category).toBe('SCOPED_KEY_CLEANUP_UNCONFIRMED');expect([f.posts,f.gets,f.deletes]).toEqual([1,1,1]);});
 it('F01-T08 raw key and keyPreview sentinels never appear in returned evidence or errors',async()=>{const {run}=await runFixture({variant:'missing-id'});const text=run.summary+run.machineReadableEvidence+String(run.errorOutput)+JSON.stringify(run.evidence);expect(text).not.toContain(RAW_KEY);expect(text).not.toContain(KEY_PREVIEW);expect(text).not.toContain(CONTROL);});
 it('F01-T09 every malformed-success recovery path keeps create POST count exactly one',async()=>{for(const variant of ['missing-api-key','missing-id','missing-key','scope-mismatch','profile-mismatch','permission-mismatch','missing-expiry','invalid-expiry'] as const){const {f}=await runFixture({variant});expect(f.posts,variant).toBe(1);}});
 it('F01-T10 well-formed create remains compatible and requires no recovery request',async()=>{const {run,f}=await runFixture({variant:'well-formed'});expect(run.evidence.result).toBe('PASS');expect([f.posts,f.gets,f.deletes]).toEqual([1,0,0]);});
 it('extra malformed reconciliation list body becomes cleanup-unconfirmed',async()=>{const {run,f}=await runFixture({variant:'missing-api-key',listBody:{unexpected:[]}});expect(run.evidence.error_category).toBe('SCOPED_KEY_CLEANUP_UNCONFIRMED');expect([f.posts,f.gets,f.deletes]).toEqual([1,1,0]);});
 it('extra failed reconciliation list request becomes cleanup-unconfirmed',async()=>{const {run,f}=await runFixture({variant:'missing-api-key',listStatus:500,listBody:{error:'provider unavailable'}});expect(run.evidence.error_category).toBe('SCOPED_KEY_CLEANUP_UNCONFIRMED');expect([f.posts,f.gets,f.deletes]).toEqual([1,1,0]);});
 it.each([
  ['scope mismatch','scope-mismatch'],
  ['profile mismatch','profile-mismatch'],
  ['permission mismatch','permission-mismatch'],
  ['missing expiry','missing-expiry'],
  ['invalid expiry','invalid-expiry'],
 ] as const)('extra known-ID %s is directly revoked and blocked',async(_label,variant)=>{const {run,f}=await runFixture({variant});expect(run.evidence.result).toBe('BLOCKED');expect(run.evidence.error_category).toBe('MALFORMED_PROVIDER_RESPONSE');expect([f.posts,f.gets,f.deletes]).toEqual([1,0,1]);});
});
