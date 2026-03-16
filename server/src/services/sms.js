const tencentcloud = require("tencentcloud-sdk-nodejs-sms")

const SmsClient = tencentcloud.sms.v20210111.Client

const clientConfig = {
  credential: {
    secretId: process.env.TENCENT_SECRET_ID || '',
    secretKey: process.env.TENCENT_SECRET_KEY || '',
  },
  region: process.env.TENCENT_REGION || 'ap-guangzhou',
  profile: {
    httpProfile: {
      endpoint: 'sms.tencentcloudapi.com',
    },
  },
}

const client = new SmsClient(clientConfig)

const SMS_CONFIG = {
  appId: process.env.TENCENT_SMS_APP_ID || '',
  signName: process.env.TENCENT_SMS_SIGN_NAME || '优派管家',
  templateId: {
    register: process.env.TENCENT_SMS_TEMPLATE_REGISTER || '',
    login: process.env.TENCENT_SMS_TEMPLATE_LOGIN || '',
    reset: process.env.TENCENT_SMS_TEMPLATE_RESET || '',
  }
}

const verificationCodes = new Map()

async function sendSms(phone, type = 'login') {
  const code = Math.random().toString().slice(-6)
  
  verificationCodes.set(phone, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
    type
  })

  if (process.env.NODE_ENV === 'development') {
    console.log(`[SMS Mock] 发送验证码到 ${phone}: ${code}`)
    return { success: true, code }
  }

  try {
    const params = {
      PhoneNumberSet: [`+86${phone}`],
      SmsSdkAppId: SMS_CONFIG.appId,
      SignName: SMS_CONFIG.signName,
      TemplateId: SMS_CONFIG.templateId[type] || SMS_CONFIG.templateId.login,
      TemplateParamSet: [code, '5'],
    }

    const response = await client.SendSms(params)
    console.log('SMS Response:', response)
    return { success: true, code }
  } catch (error) {
    console.error('SMS Error:', error)
    return { success: false, error: error.message }
  }
}

function verifyCode(phone, code) {
  const stored = verificationCodes.get(phone)
  
  if (!stored) {
    return { valid: false, message: '验证码不存在' }
  }
  
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(phone)
    return { valid: false, message: '验证码已过期' }
  }
  
  if (stored.code !== code) {
    return { valid: false, message: '验证码错误' }
  }
  
  verificationCodes.delete(phone)
  return { valid: true }
}

module.exports = {
  sendSms,
  verifyCode
}
