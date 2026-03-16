const Payment = require('wechatpay-node-v3')
const AlipaySdk = require('alipay-sdk').default

const wechatPayConfig = {
  appid: process.env.WECHAT_APP_ID || '',
  mchid: process.env.WECHAT_MCH_ID || '',
  publicKey: Buffer.from(process.env.WECHAT_PUBLIC_KEY || ''),
  privateKey: Buffer.from(process.env.WECHAT_PRIVATE_KEY || ''),
  key: process.env.WECHAT_API_KEY || '',
}

const alipayConfig = {
  appId: process.env.ALIPAY_APP_ID || '',
  privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
  gateway: 'https://openapi.alipay.com/gateway.do',
}

let wechatPay = null
let alipaySdk = null

if (wechatPayConfig.appid && wechatPayConfig.mchid) {
  wechatPay = new Payment(wechatPayConfig)
}

if (alipayConfig.appId && alipayConfig.privateKey) {
  alipaySdk = new AlipaySdk(alipayConfig)
}

async function createWechatPayment(order) {
  if (!wechatPay) {
    console.log('[Mock] 微信支付模拟:', order.orderNo)
    return {
      success: true,
      mock: true,
      qrCode: `weixin://wxpay/bizpayurl?pr=${order.orderNo}`
    }
  }

  try {
    const params = {
      description: `优派管家-${order.serviceType?.name || '家政服务'}`,
      out_trade_no: order.orderNo,
      notify_url: `${process.env.API_URL}/api/payments/wechat/notify`,
      amount: {
        total: Math.round(order.totalAmount * 100),
        currency: 'CNY'
      },
      scene_info: {
        payer_client_ip: '127.0.0.1'
      }
    }
    const result = await wechatPay.transactions_native(params)
    return { success: true, qrCode: result.code_url }
  } catch (error) {
    console.error('Wechat Pay Error:', error)
    return { success: false, error: error.message }
  }
}

async function createAlipayPayment(order) {
  if (!alipaySdk) {
    console.log('[Mock] 支付宝支付模拟:', order.orderNo)
    return {
      success: true,
      mock: true,
      payUrl: `https://openapi.alipay.com/gateway.do?order=${order.orderNo}`
    }
  }

  try {
    const formData = new Map()
    formData.set('biz_content', {
      out_trade_no: order.orderNo,
      product_code: 'FAST_INSTANT_TRADE_PAY',
      total_amount: order.totalAmount.toFixed(2),
      subject: `优派管家-${order.serviceType?.name || '家政服务'}`
    })
    formData.set('return_url', `${process.env.FRONTEND_URL}/orders/${order.id}`)
    formData.set('notify_url', `${process.env.API_URL}/api/payments/alipay/notify`)

    const result = await alipaySdk.exec('alipay.trade.page.pay', {}, { formData })
    return { success: true, payUrl: result }
  } catch (error) {
    console.error('Alipay Error:', error)
    return { success: false, error: error.message }
  }
}

async function verifyWechatPayment(notifyData) {
  if (!wechatPay) {
    return { success: true, mock: true }
  }

  try {
    const result = wechatPay.verifySign(notifyData)
    return { success: result }
  } catch (error) {
    console.error('Wechat Verify Error:', error)
    return { success: false }
  }
}

async function verifyAlipayPayment(notifyData) {
  if (!alipaySdk) {
    return { success: true, mock: true }
  }

  try {
    const result = alipaySdk.checkNotifySign(notifyData)
    return { success: result }
  } catch (error) {
    console.error('Alipay Verify Error:', error)
    return { success: false }
  }
}

module.exports = {
  createWechatPayment,
  createAlipayPayment,
  verifyWechatPayment,
  verifyAlipayPayment
}
