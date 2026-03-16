import { useState } from 'react'
import { X, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import './AuthModal.css'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToRegister: () => void
  onLogin: (user: { phone: string; nickname: string }) => void
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister, onLogin }: LoginModalProps) {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validatePhone = (phone: string) => {
    return /^1[3-9]\d{9}$/.test(phone)
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

    setLoading(true)
    
    setTimeout(() => {
      onLogin({
        phone: formData.phone,
        nickname: `用户${formData.phone.slice(-4)}`
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
          <h2 className="auth-title">欢迎回来</h2>
          <p className="auth-subtitle">登录您的优派管家账号</p>
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

          <div className="auth-input-group">
            <Lock size={18} className="auth-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              className="auth-input"
              placeholder="密码"
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

          <div className="auth-options">
            <label className="auth-remember">
              <input type="checkbox" />
              <span>记住我</span>
            </label>
            <a href="#" className="auth-forgot">忘记密码？</a>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            还没有账号？
            <button className="auth-switch" onClick={onSwitchToRegister}>
              立即注册
            </button>
          </p>
        </div>

        <div className="auth-divider">
          <span>其他登录方式</span>
        </div>

        <div className="auth-social">
          <button className="auth-social-btn wechat">
            微信登录
          </button>
        </div>
      </div>
    </div>
  )
}
