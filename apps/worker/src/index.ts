const intervalMs = 30_000;

console.log('[worker] started in safe idle mode; automation is disabled');
const heartbeat = setInterval(() => console.log('[worker] healthy; no jobs claimed'), intervalMs);

function shutdown(signal: string): void {
  console.log(`[worker] ${signal} received; stopping cleanly`);
  clearInterval(heartbeat);
  process.exitCode = 0;
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
