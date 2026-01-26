/**
 * PM2 Ecosystem Configuration for VertiGo-SaaS
 *
 * Deployment na muzx.cz subdomény
 * Server: dvi12.vas-server.cz
 *
 * Port Mapping:
 * - GigBook (musicians)        → gigbook.muzx.cz      → 3007
 * - FitAdmin (fitness)         → fitadmin.muzx.cz     → 3006
 * - ShootFlow (photography)    → shootflow.muzx.cz    → 3003
 * - TeamForge (team-building)  → teamforge.muzx.cz    → 3009
 * - EventPro (events)          → eventpro.muzx.cz     → 3005
 * - PartyPal (kids-entertainment) → partypal.muzx.cz  → 3010
 * - StageManager (performing-arts) → stagemanager.muzx.cz → 3008 (budoucnost)
 */

module.exports = {
  apps: [
    // ═══════════════════════════════════════════════════════════
    // PRIORITY 1 - Production Ready Apps
    // ═══════════════════════════════════════════════════════════

    {
      name: 'gigbook',
      cwd: '/var/www/vertigo-saas/apps/musicians',
      script: 'node_modules/.bin/next',
      args: 'start -p 3007',
      env: {
        NODE_ENV: 'production',
        PORT: 3007
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/gigbook-error.log',
      out_file: '/var/log/pm2/gigbook-out.log',
      merge_logs: true,
      time: true
    },

    {
      name: 'fitadmin',
      cwd: '/var/www/vertigo-saas/apps/fitness',
      script: 'node_modules/.bin/next',
      args: 'start -p 3006',
      env: {
        NODE_ENV: 'production',
        PORT: 3006
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/fitadmin-error.log',
      out_file: '/var/log/pm2/fitadmin-out.log',
      merge_logs: true,
      time: true
    },

    // ═══════════════════════════════════════════════════════════
    // PRIORITY 2 - Near Production Ready
    // ═══════════════════════════════════════════════════════════

    {
      name: 'shootflow',
      cwd: '/var/www/vertigo-saas/apps/photography',
      script: 'node_modules/.bin/next',
      args: 'start -p 3003',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/shootflow-error.log',
      out_file: '/var/log/pm2/shootflow-out.log',
      merge_logs: true,
      time: true
    },

    {
      name: 'teamforge',
      cwd: '/var/www/vertigo-saas/apps/team-building',
      script: 'node_modules/.bin/next',
      args: 'start -p 3009',
      env: {
        NODE_ENV: 'production',
        PORT: 3009
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/teamforge-error.log',
      out_file: '/var/log/pm2/teamforge-out.log',
      merge_logs: true,
      time: true
    },

    // ═══════════════════════════════════════════════════════════
    // PRIORITY 3 - In Development
    // ═══════════════════════════════════════════════════════════

    {
      name: 'eventpro',
      cwd: '/var/www/vertigo-saas/apps/events',
      script: 'node_modules/.bin/next',
      args: 'start -p 3005',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/eventpro-error.log',
      out_file: '/var/log/pm2/eventpro-out.log',
      merge_logs: true,
      time: true
    },

    {
      name: 'partypal',
      cwd: '/var/www/vertigo-saas/apps/kids-entertainment',
      script: 'node_modules/.bin/next',
      args: 'start -p 3010',
      env: {
        NODE_ENV: 'production',
        PORT: 3010
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/partypal-error.log',
      out_file: '/var/log/pm2/partypal-out.log',
      merge_logs: true,
      time: true
    }

    // ═══════════════════════════════════════════════════════════
    // PRIORITY 4 - Future (Uncomment when ready)
    // ═══════════════════════════════════════════════════════════

    // {
    //   name: 'stagemanager',
    //   cwd: '/var/www/vertigo-saas/apps/performing-arts',
    //   script: 'node_modules/.bin/next',
    //   args: 'start -p 3008',
    //   env: {
    //     NODE_ENV: 'production',
    //     PORT: 3008
    //   },
    //   instances: 1,
    //   exec_mode: 'fork',
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '1G',
    //   error_file: '/var/log/pm2/stagemanager-error.log',
    //   out_file: '/var/log/pm2/stagemanager-out.log',
    //   merge_logs: true,
    //   time: true
    // }
  ]
};
