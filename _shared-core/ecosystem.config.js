module.exports = {
  apps: [
    {
      name: 'divadlo-studna',
      script: 'server.js',
      cwd: '/var/www/divadlostudna.cz/standalone',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
