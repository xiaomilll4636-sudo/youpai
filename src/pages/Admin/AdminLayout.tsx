import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, Users, FileText, Settings, Menu, X, 
  Bell, LogOut, User, BarChart3, Calendar
} from 'lucide-react'
import './AdminLayout.css'

interface AdminLayoutProps {
  children: React.ReactNode
  activeMenu: string
}

export function AdminLayout({ children, activeMenu }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminUser] = useState({ name: '管理员', role: '超级管理员' })
  const navigate = useNavigate()

  const menuItems = [
    { id: 'dashboard', label: '数据概览', icon: LayoutDashboard, path: '/admin' },
    { id: 'orders', label: '订单管理', icon: FileText, path: '/admin/orders' },
    { id: 'users', label: '用户管理', icon: Users, path: '/admin/users' },
    { id: 'housekeepers', label: '阿姨管理', icon: User, path: '/admin/housekeepers' },
    { id: 'services', label: '服务管理', icon: Settings, path: '/admin/services' },
    { id: 'reviews', label: '评价管理', icon: BarChart3, path: '/admin/reviews' },
    { id: 'schedule', label: '排班管理', icon: Calendar, path: '/admin/schedule' },
    { id: 'settings', label: '系统设置', icon: Settings, path: '/admin/settings' },
  ]

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('admin-token')
      navigate('/admin/login')
    }
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">
            {sidebarOpen ? '优派管家后台' : '优'}
          </h1>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={24} />
            </button>
          </div>

          <div className="header-right">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>

            <div className="admin-user">
              <div className="user-avatar">
                <User size={18} />
              </div>
              <div className="user-info">
                <span className="user-name">{adminUser.name}</span>
                <span className="user-role">{adminUser.role}</span>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}
