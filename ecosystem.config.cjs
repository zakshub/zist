/* global module, __dirname */
module.exports = {
  apps: [
    {
      name: 'zak-content-web',
      cwd: __dirname,
      script: 'pnpm',
      args: 'start:web',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      max_memory_restart: '750M',
      kill_timeout: 10000,
      env: { NODE_ENV: 'production', PORT: '3000' },
    },
    {
      name: 'zak-content-worker',
      cwd: __dirname,
      script: 'node',
      args: 'apps/worker/dist/index.js',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
      kill_timeout: 10000,
      env: { NODE_ENV: 'production', AUTOMATION_ENABLED: 'false' },
    },
  ],
};
