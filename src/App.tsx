import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/Header/Header'
import { Hero } from './components/Hero/Hero'
import { Services } from './components/Services/Services'
import { PlatformGuarantee } from './components/PlatformGuarantee/PlatformGuarantee'
import { BookingModal, type BookingFormData } from './components/BookingModal/BookingModal'
import { LoginModal } from './components/Auth/LoginModal'
import { RegisterModal } from './components/Auth/RegisterModal'
import { Footer } from './components/Footer/Footer'
import { useAuthStore } from './store/auth'
import type { ServiceType } from './types/housekeeping'
import { OrderPage } from './pages/Order/OrderPage'
import { OrderDetailPage } from './pages/Order/OrderDetailPage'
import { ProfilePage } from './pages/Profile/ProfilePage'
import { orderApi } from './api/orders'
import './styles/global.css'

const mockServices: ServiceType[] = [
  { id: '1', name: '日常保洁', icon: '🏠', description: '家庭日常清洁、整理收纳、垃圾清理', sortOrder: 1 },
  { id: '2', name: '深度清洁', icon: '✨', description: '厨房油烟机清洗、卫生间深度消毒、玻璃清洁', sortOrder: 2 },
  { id: '3', name: '开荒保洁', icon: '🧹', description: '新房装修后清洁、除胶除漆、全面除尘', sortOrder: 3 },
  { id: '4', name: '家电维修', icon: '🔧', description: '空调维修、洗衣机维修、冰箱维修、热水器维修', sortOrder: 4 },
  { id: '5', name: '养老护理', icon: '👴', description: '老人日常照料、陪护就医、康复训练', sortOrder: 5 },
  { id: '6', name: '钟点工', icon: '⏰', description: '临时清洁、做饭、跑腿等灵活服务', sortOrder: 6 },
]

function HomePage({ onBookNow, onServiceSelect }: { onBookNow: () => void, onServiceSelect: (s: ServiceType) => void }) {
  return (
    <>
      <Hero onBookNow={onBookNow} />
      <Services services={mockServices} onSelect={onServiceSelect} />
      <PlatformGuarantee />
    </>
  )
}

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceType | undefined>()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const location = useLocation()
  
  const { user, isLoggedIn, login, logout } = useAuthStore()

  const handleBookNow = () => {
    setIsBookingOpen(true)
  }

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service)
    setIsBookingOpen(true)
  }

  const handleBookingSubmit = async (data: BookingFormData) => {
    try {
      await orderApi.createPublic({
        serviceTypeId: data.serviceTypeId,
        date: data.date,
        time: data.time,
        duration: data.duration,
        address: data.address,
        detailAddress: data.detailAddress,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        remark: data.remark
      })
      alert('预约成功！客服人员收到您的需求后将尽快与您致电确认细节。')
    } catch (error: any) {
      alert(error.message || '预约提交失败，请重试')
      console.error('Booking failed:', error)
    }
  }

  const handleLogin = (userData: any) => {
    login(userData)
    setIsLoginOpen(false)
  }

  const handleRegister = (userData: any) => {
    login(userData)
    setIsRegisterOpen(false)
  }

  // 不是首页时显示简版 Header 或调整内距
  const isHome = location.pathname === '/'

  return (
    <div className="app">
      <Header 
        onLoginClick={() => setIsLoginOpen(true)}
        user={user}
        isLoggedIn={isLoggedIn}
        onLogout={logout}
      />
      
      <main className={!isHome ? 'page-content' : ''}>
        <Routes>
          <Route path="/" element={<HomePage onBookNow={handleBookNow} onServiceSelect={handleServiceSelect} />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      
      <Footer />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false)
          setSelectedService(undefined)
        }}
        service={selectedService}
        onSubmit={handleBookingSubmit}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false)
          setIsRegisterOpen(true)
        }}
        onLogin={handleLogin}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false)
          setIsLoginOpen(true)
        }}
        onRegister={handleRegister}
      />
    </div>
  )
}

export default App
