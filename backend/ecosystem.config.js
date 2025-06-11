module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'server.js',
      cwd: __dirname,
      env: {
        NODE_ENV:   'production',
        PORT:       8443,
        DB_URL:     'postgres://user:pass@localhost:5432/iot',
        JWT_SECRET: '1ae16e80049c0e2212484bdff18c99a0'
      }
    }
  ]
}
