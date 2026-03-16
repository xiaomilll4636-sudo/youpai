const serverless = require('serverless-http');

// 设置环境变量，确保 dotenv 能正确加载
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../server/.env') });

// 引入 Express 应用（不启动 listen）
const app = require('../../server/src/app');

// 将 Express 包装为 Serverless 函数
module.exports.handler = serverless(app, {
  basePath: '/.netlify/functions/api'
});
