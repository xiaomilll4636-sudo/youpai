import { useNavigate } from 'react-router-dom'
import { User, MapPin, FileText, Settings, HelpCircle, ChevronRight, LogOut } from 'lucide-react'
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

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.nickname} />
          ) : (
            <User size={40} />
          )}
        </div>
        <div className="profile-info">
          <h2>{user?.nickname || '用户'}</h2>
          <p>{user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-value">12</span>
          <span className="stat-label">已完成订单</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">3</span>
          <span className="stat-label">待服务</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">5</span>
          <span className="stat-label">收藏阿姨</span>
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
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
            <div className="menu-item-right">
              {item.badge && <span className="menu-badge">{item.badge}</span>}
              <ChevronRight size={18} />
            </div>
          </button>
        ))}
      </div>

      <div className="profile-section">
        <h3>联系客服</h3>
        <div className="contact-info">
          <p>客服电话：<a href="tel:133-9298-3782">133-9298-3782</a></p>
          <p>工作时间：周一至周日 8:00-22:00</p>
        </div>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={18} />
        退出登录
      </button>
    </div>
  )
}
