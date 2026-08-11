import {expect,it} from 'vitest';
import {MockArticlePipeline,similarityScore} from './index.js';

it('detects identical-source similarity',()=>{expect(similarityScore('ایک مکمل خیال','ایک مکمل خیال'.split('|'))).toBe(1);});
it('generates a reviewable Urdu package with provenance',()=>{
  const draft=new MockArticlePipeline().generate({topic:{id:'t1',name:'معاشرہ',description:'',category:'معاشرہ',keywords:['مکالمہ'],status:'CANDIDATE',sourcePostCount:1,noveltyScore:1,relevanceScore:.8,qualityScore:.7,diversityScore:.5,finalScore:.8,scoringVersion:'memory-v1'},sources:[{id:'s1',text:'اختلاف سوچ کو بہتر بناتا ہے۔'}]});
  expect(draft.contentMarkdown).toContain('## نتیجہ');expect(draft.sourcePostIds).toEqual(['s1']);expect(draft.similarityScore).toBeLessThan(.5);
});
