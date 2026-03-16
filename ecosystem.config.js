module.exports = {
  apps: [
    {
      name: "youpai-backend",
      script: "./server/src/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      },
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: "youpai-frontend",
      script: "npx",
      args: "serve -s dist -l 5173",
      env: {
        NODE_ENV: "production",
      },
      watch: false
    }
  ]
};
