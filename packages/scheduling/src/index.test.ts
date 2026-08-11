import{expect,it}from'vitest';import{recommendSchedule}from'./index.js';
it('selects the next valid Karachi window deterministically',()=>{expect(recommendSchedule('2026-08-12T08:30:00.000Z',.8,[])?.scheduledAt).toBe('2026-08-12T14:30:00.000Z')});
it('enforces threshold, daily budget, and six hour gap',()=>{expect(recommendSchedule('2026-08-12T00:00:00.000Z',.4,[])).toBeNull();const existing=['2026-08-12T08:00:00.000Z','2026-08-12T14:30:00.000Z'];expect(recommendSchedule('2026-08-12T00:00:00.000Z',.8,existing)?.scheduledAt).toBe('2026-08-13T08:00:00.000Z')});
