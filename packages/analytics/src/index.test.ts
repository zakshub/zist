import{expect,it}from'vitest';import{normalizeMetrics}from'./index.js';
it('normalizes raw metrics with bounded confidence',()=>{expect(normalizeMetrics({impressions:1000,reach:800,reactions:40,comments:10,shares:5,linkClicks:25})).toMatchObject({engagements:80,engagementRate:.1,clickThroughRate:.025,confidence:.8})});
it('rejects impossible raw observations',()=>{expect(()=>normalizeMetrics({impressions:10,reach:11,reactions:0,comments:0,shares:0,linkClicks:0})).toThrow(/Reach/)});
