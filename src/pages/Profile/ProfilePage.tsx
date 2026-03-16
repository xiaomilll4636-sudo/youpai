import { useNavigate } from 'react-router-dom'
import { User, MapPin, FileText, Settings, HelpCircle, ChevronRight, LogOut, Clock, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import './ProfilePage.css'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useAuthStore()

  if (!isLoggedIn) {
    navigate('/')
    return null
  }

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout()
      navigate('/')
    }
  }

  const menuItems = [
    { icon: FileText, label: '我的订单', path: '/orders', badge: '3' },
    { icon: MapPin, label: '地址管理', path: '/addresses' },
    { icon: User, label: '个人资料', path: '/profile/edit' },
    { icon: Settings, label: '账号设置', path: '/settings' },
    { icon: HelpCircle, label: '帮助中心', path: '/help' },
  ]

  const stats = [
    { label: '账户余额', value: `¥${user?.balance || '0.00'}`, color: '#10B981' },
    { label: '优惠券', value: user?.couponCount || '5', unit: '张', color: '#F59E0B' },
    { label: '积分', value: user?.points || '1,280', color: '#3B82F6' },
  ]

  return (
    <div className="profile-page">
      <div className="profile-header-container">
        <div className="profile-header-content">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.nickname} />
              ) : (
                <User size={48} />
              )}
            </div>
            <button className="avatar-edit-btn" title="编辑头像">
              <Settings size={14} />
            </button>
          </div>
          <div className="profile-info">
            <h2>{user?.nickname || '优派会员'}</h2>
            <div className="profile-tags">
              <span className="tag-vip">黄金会员</span>
              <span className="tag-status">已实名</span>
            </div>
            <p className="profile-phone">{user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
          </div>
        </div>
      </div>

      <div className="profile-dashboard">
        {stats.map((stat, idx) => (
          <div key={idx} className="dashboard-item">
            <span className="dashboard-value" style={{ color: stat.color }}>
              {stat.value}{stat.unit || ''}
            </span>
            <span className="dashboard-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="order-stats-bar">
        <div className="order-stat" onClick={() => navigate('/orders?tab=pending')}>
          <div className="order-stat-icon pending">
            <Clock size={20} />
            <span className="dot"></span>
          </div>
          <span>待服务</span>
        </div>
        <div className="order-stat" onClick={() => navigate('/orders?tab=completed')}>
          <div className="order-stat-icon completed">
            <CheckCircle size={20} />
          </div>
          <span>已完成</span>
        </div>
        <div className="order-stat" onClick={() => navigate('/orders')}>
          <div className="order-stat-icon all">
            <FileText size={20} />
          </div>
          <span>全部订单</span>
        </div>
      </div>

      <div className="profile-menu">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="menu-item"
            onClick={() => navigate(item.path)}
          >
            <div className="menu-item-left">
              <div className="menu-icon-bg">
                <item.icon size={18} />
              </div>
              <span>{item.label}</span>
            </div>
            <div className="menu-item-right">
              {item.badge && <span className="menu-badge">{item.badge}</span>}
              <ChevronRight size={18} />
            </div>
          </button>
        ))}
      </div>

      <div className="profile-support">
        <div className="support-card">
          <div className="support-info">
            <h4>专属客服</h4>
            <p>遇到问题？找小优为您解决</p>
          </div>
          <button className="support-btn" onClick={() => window.location.href = 'tel:133-9298-3782'}>立即咨询</button>
        </div>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={18} />
        退出登录
      </button>
    </div>
  )
}
