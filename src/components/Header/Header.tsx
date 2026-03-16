import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Phone, User, LogOut, ChevronDown } from 'lucide-react'
import type { User as UserType } from '../../store/auth'
import './Header.css'

interface HeaderProps {
  onLoginClick?: () => void
  user?: UserType | null
  isLoggedIn?: boolean
  onLogout?: () => void
}

export function Header({ onLoginClick, user, isLoggedIn, onLogout }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  const navItems = [
    { label: '首页', href: '/#home' },
    { label: '服务项目', href: '/#services' },
    { label: '平台保障', href: '/#about' },
  ]

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false)
    if (href.startsWith('/#')) {
      const id = href.substring(2)
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <span className="logo-icon">优</span>
          <div className="logo-text">
            <span className="logo-name">优派管家</span>
            <span className="logo-slogan">专业家政服务</span>
          </div>
        </Link>

        <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="nav-link"
              onClick={() => handleNavClick(item.href)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a href="tel:13392983782" className="header-phone">
            <Phone size={16} />
            <span>133-9298-3782</span>
          </a>
          
          {isLoggedIn && user ? (
            <div className="header-user">
              <button 
                className="header-user-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.nickname} />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <span className="user-name">{user.nickname}</span>
                <ChevronDown size={14} />
              </button>
              
              {isUserMenuOpen && (
                <div className="header-user-menu">
                  <Link 
                    to="/orders" 
                    className="user-menu-item"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    我的订单
                  </Link>
                  <Link 
                    to="/profile" 
                    className="user-menu-item"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    个人中心
                  </Link>
                  <button 
                    className="user-menu-item logout"
                    onClick={() => {
                      onLogout?.()
                      setIsUserMenuOpen(false)
                      navigate('/')
                    }}
                  >
                    <LogOut size={16} />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onLoginClick}>
              <User size={16} />
              登录
            </button>
          )}
          
          <button
            className="header-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  )
}
