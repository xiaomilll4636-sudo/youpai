import { useState } from 'react'
import { X, Phone, Lock, User, Eye, EyeOff, Shield } from 'lucide-react'
import './AuthModal.css'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
  onRegister: (user: { phone: string; nickname: string }) => void
}

export function RegisterModal({ isOpen, onClose, onSwitchToLogin, onRegister }: RegisterModalProps) {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    code: '',
    nickname: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')

  const validatePhone = (phone: string) => {
    return /^1[3-9]\d{9}$/.test(phone)
  }

  const sendCode = () => {
    if (!validatePhone(formData.phone)) {
      setError('请输入正确的手机号码')
      return
    }

    setCodeSent(true)
    setCountdown(60)
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCodeSent(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validatePhone(formData.phone)) {
      setError('请输入正确的手机号码')
      return
    }

    if (formData.password.length < 6) {
      setError('密码至少6位')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次密码不一致')
      return
    }

    if (!formData.code) {
      setError('请输入验证码')
      return
    }

    setLoading(true)
    
    setTimeout(() => {
      onRegister({
        phone: formData.phone,
        nickname: formData.nickname || `用户${formData.phone.slice(-4)}`
      })
      setLoading(false)
      onClose()
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="auth-header">
          <h2 className="auth-title">创建账号</h2>
          <p className="auth-subtitle">注册优派管家账号</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-input-group">
            <Phone size={18} className="auth-input-icon" />
            <input
              type="tel"
              className="auth-input"
              placeholder="手机号码"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              maxLength={11}
            />
          </div>

          <div className="auth-input-group auth-code-group">
            <Shield size={18} className="auth-input-icon" />
            <input
              type="text"
              className="auth-input"
              placeholder="验证码"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              maxLength={6}
            />
            <button
              type="button"
              className="auth-code-btn"
              onClick={sendCode}
              disabled={codeSent}
            >
              {codeSent ? `${countdown}s` : '获取验证码'}
            </button>
          </div>

          <div className="auth-input-group">
            <User size={18} className="auth-input-icon" />
            <input
              type="text"
              className="auth-input"
              placeholder="昵称（选填）"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            />
          </div>

          <div className="auth-input-group">
            <Lock size={18} className="auth-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              className="auth-input"
              placeholder="密码（至少6位）"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="auth-input-group">
            <Lock size={18} className="auth-input-icon" />
            <input
              type="password"
              className="auth-input"
              placeholder="确认密码"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <label className="auth-agreement">
            <input type="checkbox" required />
            <span>我已阅读并同意 <a href="#">服务协议</a> 和 <a href="#">隐私政策</a></span>
          </label>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            已有账号？
            <button className="auth-switch" onClick={onSwitchToLogin}>
              立即登录
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
