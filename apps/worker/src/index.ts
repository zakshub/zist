const intervalMs = 30_000;

console.log('[worker] started in safe idle mode; automation is disabled');
setInterval(() => console.log('[worker] healthy; no jobs claimed'), intervalMs);

