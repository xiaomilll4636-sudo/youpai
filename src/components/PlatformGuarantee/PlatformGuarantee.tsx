import { Shield, Clock, Award, Headphones, CreditCard, ThumbsUp } from 'lucide-react'
import './PlatformGuarantee.css'

export function PlatformGuarantee() {
  const guarantees = [
    {
      icon: Shield,
      title: '安全保障',
      description: '服务人员实名认证，全程保险保障'
    },
    {
      icon: Clock,
      title: '准时服务',
      description: '准时上门，超时赔付'
    },
    {
      icon: Award,
      title: '品质保证',
      description: '不满意免费返工，7天无忧售后'
    },
    {
      icon: Headphones,
      title: '专属客服',
      description: '7×24小时在线，随时解答疑问'
    },
    {
      icon: CreditCard,
      title: '透明定价',
      description: '明码标价，无隐形消费'
    },
    {
      icon: ThumbsUp,
      title: '好评如潮',
      description: '累计服务10万+家庭，好评率98%'
    }
  ]

  const stats = [
    { value: '10万+', label: '服务家庭' },
    { value: '98%', label: '好评率' },
    { value: '5000+', label: '认证服务人员' },
    { value: '7天', label: '无忧售后' }
  ]

  return (
    <section className="platform-guarantee" id="about">
      <div className="container">
        <div className="section-header">
          <span className="section-badge badge badge-primary">平台保障</span>
          <h2 className="section-title">为什么选择优派管家</h2>
          <p className="section-subtitle">专业、安全、可靠的家政服务平台</p>
        </div>

        <div className="guarantee-stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="guarantee-grid">
          {guarantees.map((item, index) => (
            <div key={index} className="guarantee-card">
              <div className="guarantee-icon">
                <item.icon size={28} />
              </div>
              <h3 className="guarantee-title">{item.title}</h3>
              <p className="guarantee-desc">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="guarantee-cta">
          <div className="cta-content">
            <h3>立即预约，享受专业服务</h3>
            <p>新用户首单立减20元</p>
          </div>
          <a href="tel:133-9298-3782" className="btn btn-primary btn-lg">
            电话咨询：133-9298-3782
          </a>
        </div>
      </div>
    </section>
  )
}
