# 优派管家 - 密钥配置指南

## 一、腾讯云短信配置

### 1. 注册腾讯云账号
1. 访问 https://cloud.tencent.com
2. 点击右上角"注册"，完成账号注册
3. 完成实名认证（需要身份证）

### 2. 开通短信服务
1. 访问 https://console.cloud.tencent.com/smsv2
2. 点击"立即开通"
3. 选择"国内短信" → "开始接入"

### 3. 创建签名
1. 进入"国内短信" → "签名管理"
2. 点击"创建签名"
3. 填写信息：
   - 签名类型：公司
   - 签名内容：优派管家（或你的公司名）
   - 上传营业执照
4. 等待审核（通常1-2小时）

### 4. 创建短信模板
1. 进入"正文模板管理"
2. 点击"创建正文模板"
3. 模板内容示例：
   ```
   您的验证码为{1}，有效期{2}分钟，请勿泄露给他人。
   ```
4. 记下模板ID

### 5. 创建应用并获取密钥
1. 进入"应用管理" → "应用列表"
2. 点击"创建应用"
3. 记下 SDKAppID

### 6. 获取 SecretId 和 SecretKey
1. 访问 https://console.cloud.tencent.com/cam/capi
2. 点击"新建密钥"
3. 记下 SecretId 和 SecretKey

### 7. 配置环境变量
在 `server/.env` 文件中添加：
```env
# 腾讯云短信
TENCENT_SECRET_ID=你的SecretId
TENCENT_SECRET_KEY=你的SecretKey
TENCENT_REGION=ap-guangzhou
TENCENT_SMS_APP_ID=你的SDKAppID
TENCENT_SMS_SIGN_NAME=优派管家
TENCENT_SMS_TEMPLATE_REGISTER=注册模板ID
TENCENT_SMS_TEMPLATE_LOGIN=登录模板ID
TENCENT_SMS_TEMPLATE_RESET=重置密码模板ID
```

---

## 二、微信支付配置

### 1. 注册微信支付商户号
1. 访问 https://pay.weixin.qq.com
2. 点击"成为商家"
3. 准备材料：
   - 营业执照
   - 法人身份证
   - 银行账户信息
4. 提交审核（通常1-3个工作日）

### 2. 获取商户信息
审核通过后，在商户平台获取：
- 商户号（mch_id）
- AppID（关联的公众号/小程序AppID）

### 3. 设置API密钥
1. 登录商户平台
2. 进入"账户中心" → "API安全"
3. 点击"设置API密钥"
4. 设置32位密钥（自己设置，记住它）
5. 下载证书文件：
   - apiclient_cert.pem（公钥）
   - apiclient_key.pem（私钥）

### 4. 配置环境变量
```env
# 微信支付
WECHAT_APP_ID=你的AppID
WECHAT_MCH_ID=你的商户号
WECHAT_PUBLIC_KEY=-----BEGIN CERTIFICATE-----公钥内容-----END CERTIFICATE-----
WECHAT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----私钥内容-----END PRIVATE KEY-----
WECHAT_API_KEY=你的32位API密钥
```

---

## 三、支付宝支付配置

### 1. 注册支付宝开放平台
1. 访问 https://open.alipay.com
2. 登录支付宝账号
3. 完成开发者入驻

### 2. 创建应用
1. 进入"控制台" → "我的应用"
2. 点击"创建应用"
3. 选择"网页/移动应用"
4. 添加"电脑网站支付"能力

### 3. 获取应用信息
1. 在应用详情页获取：
   - APPID
   - 应用公钥
   - 应用私钥
   - 支付宝公钥

### 4. 生成密钥对
1. 下载"支付宝密钥生成工具"
   - Windows: https://opendocs.alipay.com/common/02kipk
2. 运行工具，选择"RSA2(SHA256)"
3. 生成密钥对
4. 复制"应用公钥"到支付宝后台
5. 获取"支付宝公钥"

### 5. 配置环境变量
```env
# 支付宝支付
ALIPAY_APP_ID=你的APPID
ALIPAY_PRIVATE_KEY=你的应用私钥
ALIPAY_PUBLIC_KEY=支付宝公钥
```

---

## 四、完整配置示例

创建 `server/.env` 文件：

```env
# 服务配置
NODE_ENV=development
PORT=3001

# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=替换为你的数据库密码
DB_NAME=youpai_housekeeping

# JWT密钥（自己生成一个随机字符串）
JWT_SECRET=替换为你的JWT密钥

# 前端地址
FRONTEND_URL=http://localhost:83

# 腾讯云短信
TENCENT_SECRET_ID=替换为你的SecretId
TENCENT_SECRET_KEY=替换为你的SecretKey
TENCENT_REGION=ap-guangzhou
TENCENT_SMS_APP_ID=替换为你的AppId
TENCENT_SMS_SIGN_NAME=优派管家
TENCENT_SMS_TEMPLATE_REGISTER=替换为模板ID
TENCENT_SMS_TEMPLATE_LOGIN=替换为模板ID
TENCENT_SMS_TEMPLATE_RESET=替换为模板ID

# 微信支付
WECHAT_APP_ID=替换为你的AppID
WECHAT_MCH_ID=替换为你的商户号
WECHAT_API_KEY=替换为你的API密钥
WECHAT_PUBLIC_KEY=替换为公钥内容
WECHAT_PRIVATE_KEY=替换为私钥内容

# 支付宝支付
ALIPAY_APP_ID=替换为你的APPID
ALIPAY_PRIVATE_KEY=替换为你的应用私钥
ALIPAY_PUBLIC_KEY=替换为支付宝公钥
```

---

## 五、开发环境模拟

如果暂时没有密钥，系统会自动使用模拟模式：

- **短信验证码**：验证码会打印在控制台
- **微信支付**：返回模拟支付二维码
- **支付宝支付**：返回模拟支付链接

开发环境下无需配置真实密钥即可测试！

---

## 六、生产环境部署

生产环境建议使用环境变量或密钥管理服务：

### 方法一：服务器环境变量
```bash
export TENCENT_SECRET_ID="你的SecretId"
export TENCENT_SECRET_KEY="你的SecretKey"
# ... 其他配置
```

### 方法二：使用 .env 文件（不提交到Git）
```bash
# 添加到 .gitignore
echo ".env" >> .gitignore
```

### 方法三：使用云服务密钥管理
- 阿里云：KMS 密钥管理服务
- 腾讯云：密钥管理系统
- AWS：Secrets Manager

---

## 七、安全建议

1. **不要提交密钥到 Git**
   - 确保 `.env` 在 `.gitignore` 中

2. **定期更换密钥**
   - 建议每3-6个月更换一次

3. **限制密钥权限**
   - 只开通必要的服务权限

4. **监控密钥使用**
   - 设置异常使用告警

5. **生产环境使用 HTTPS**
   - 确保数据传输加密
