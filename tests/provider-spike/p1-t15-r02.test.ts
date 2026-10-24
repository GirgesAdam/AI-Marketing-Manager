import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFile, rm } from 'node:fs/promises';
import type { ProviderTransport } from '../../src/provider-spike/types.js';
import { P1_T15_EVIDENCE_PATH, parseP1T15Args } from '../../src/provider-spike/p1-t15-runner.js';
import { FixedP1T15R02Journal, P1_T15_R02_EVIDENCE_PATH, runP1T15R02 } from '../../src/provider-spike/p1-t15-r02-runner.js';

const API='P1T15_R02_SECRET_SENTINEL';
const EMAIL='p1-t15-r02@example.invalid';

afterEach(async()=>{await rm(P1_T15_R02_EVIDENCE_PATH,{force:true});});

describe('P1-T15-R02 lifecycle remediation wrapper',()=>{
  it('R02-01 defaults live OFF with zero Provider calls',async()=>{
    const send=vi.fn(); const transport:ProviderTransport={kind:'mock',send};
    const result=await runP1T15R02({env:{},transport});
    expect(result.errorCategory).toBe('LIVE_OPT_IN_REQUIRED'); expect(send).not.toHaveBeenCalled();
  });
  it('R02-02 accepts only explicit --live and no target/url/retry selectors',()=>{
    expect(parseP1T15Args([])).toEqual({ok:true,live:false});
    expect(parseP1T15Args(['--live'])).toEqual({ok:true,live:true});
    for(const args of [['--url=x'],['--post=x'],['--live','--retry']])expect(parseP1T15Args(args)).toEqual({ok:false,live:false});
  });
  it('R02-03 uses a new fixed gitignored evidence path distinct from parent/R01',async()=>{
    expect(P1_T15_R02_EVIDENCE_PATH).toBe('artifacts/provider-spike/p1-t15-r02-evidence.jsonl');
    expect(P1_T15_R02_EVIDENCE_PATH).not.toBe(P1_T15_EVIDENCE_PATH);
    expect(P1_T15_R02_EVIDENCE_PATH).not.toBe('artifacts/provider-spike/p1-t15-r01-evidence.jsonl');
    expect(await readFile('.gitignore','utf8')).toContain('artifacts/provider-spike/');
  });
  it('R02-04 fixed journal persists only the requested safe checkpoint',async()=>{
    const journal=new FixedP1T15R02Journal(); await journal.initialize([API,EMAIL]);
    await journal.append('RUN_STARTED',{requestMax:12,readOnly:false},[API,EMAIL]);
    const text=await readFile(P1_T15_R02_EVIDENCE_PATH,'utf8');
    expect(text).toContain('RUN_STARTED'); expect(text).not.toContain(API); expect(text).not.toContain(EMAIL);
  });
  it('R02-05 fixed journal rejects secret and user-PII material before persistence',async()=>{
    const journal=new FixedP1T15R02Journal(); await journal.initialize([API,EMAIL]);
    await expect(journal.append('RUN_STARTED',{apiKey:API},[API,EMAIL])).rejects.toThrow('SAFETY_EVIDENCE_SECRET_OR_PII_LEAK_PREVENTED');
    await expect(journal.append('RUN_STARTED',{commenterId:'real-user'},[API,EMAIL])).rejects.toThrow('SAFETY_EVIDENCE_SECRET_OR_PII_LEAK_PREVENTED');
  });
  it('R02-06 source cannot address P1-T14 or create alternate Provider behavior',async()=>{
    const source=await readFile('src/provider-spike/p1-t15-r02-runner.ts','utf8');
    expect(source).not.toContain('p1-t14'); expect(source).not.toContain('media.zernio.com');
    expect(source).not.toContain('/v1/comment-automations'); expect(source).toContain('runP1T15');
  });
});
