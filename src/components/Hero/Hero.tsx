import { ArrowRight, Shield, Clock, Award } from 'lucide-react'
import './Hero.css'

interface HeroProps {
  onBookNow: () => void
}

export function Hero({ onBookNow }: HeroProps) {
  const features = [
    { icon: Shield, title: '实名认证', desc: '全员实名背景调查' },
    { icon: Clock, title: '准时上门', desc: '迟到10分钟免单' },
    { icon: Award, title: '服务保障', desc: '不满意免费返工' },
  ]

  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <div className="hero-gradient"></div>
        <div className="hero-pattern"></div>
      </div>
      
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge animate-fadeIn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-primary">专业家政服务平台</span>
            <span className="badge" style={{ background: '#FF4D4F', color: 'white', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }} onClick={() => window.location.reload()}>V2.1-02:00</span>
          </div>
          
          <h1 className="hero-title animate-slideUp">
            让家更温馨
            <br />
            <span className="hero-title-highlight">专业家政服务</span>
          </h1>
          
          <p className="hero-desc animate-slideUp" style={{ animationDelay: '0.1s' }}>
            优派管家为您提供专业的家政服务，严格筛选每一位服务人员，
            让您享受安心、省心、放心的品质生活。
          </p>
          
          <div className="hero-actions animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <button className="btn btn-primary btn-lg" onClick={onBookNow}>
              立即预约
              <ArrowRight size={20} />
            </button>
            <button className="btn btn-outline btn-lg">
              了解更多
            </button>
          </div>
          
          <div className="hero-features animate-slideUp" style={{ animationDelay: '0.3s' }}>
            {features.map((feature, index) => (
              <div key={index} className="hero-feature">
                <div className="hero-feature-icon">
                  <feature.icon size={20} />
                </div>
                <div className="hero-feature-text">
                  <span className="hero-feature-title">{feature.title}</span>
                  <span className="hero-feature-desc">{feature.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="hero-visual animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <div className="hero-image-wrapper">
            <div className="hero-image-placeholder">
              <span>优派管家</span>
              <small>专业服务 · 品质生活</small>
            </div>
          </div>
          
          
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">50,000+</span>
              <span className="hero-stat-label">服务家庭</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">1,200+</span>
              <span className="hero-stat-label">认证阿姨</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">4.9</span>
              <span className="hero-stat-label">用户评分</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
