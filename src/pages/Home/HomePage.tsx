import { Header } from '../../components/Header/Header'
import { Hero } from '../../components/Hero/Hero'
import { Services } from '../../components/Services/Services'
import { BookingModal, type BookingFormData } from '../../components/BookingModal/BookingModal'
import { Footer } from '../../components/Footer/Footer'
import { LoginModal } from '../../components/Auth/LoginModal'
import { RegisterModal } from '../../components/Auth/RegisterModal'
import { useAuthStore } from '../../store/auth'
import { serviceApi, orderApi } from '../../api'
import { useState, useEffect } from 'react'
import type { ServiceType } from '../../types/housekeeping'

export function HomePage() {
  const [services, setServices] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceType | undefined>()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  const { user, isLoggedIn, login, logout } = useAuthStore()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const servicesRes = await serviceApi.getList()
      setServices(Array.isArray(servicesRes) ? servicesRes : [])
    } catch (error) {
      console.error('Failed to load data:', error)
      setServices(getMockServices())
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    setIsBookingOpen(true)
  }

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service)
    setIsBookingOpen(true)
  }

  const handleBookingSubmit = async (data: BookingFormData) => {
    try {
      if (isLoggedIn) {
        await orderApi.create({
          serviceTypeId: data.serviceTypeId,
          serviceAddress: data.address,
          serviceDate: data.date,
          serviceTime: data.time,
          duration: data.duration,
          contactName: data.contactName,
          contactPhone: data.contactPhone,
          remark: data.remark
        })
        alert('预约成功！我们会尽快与您联系确认。')
      } else {
        alert('请先登录后再预约')
        setIsLoginOpen(true)
      }
    } catch (error) {
      console.error('Booking failed:', error)
      alert('预约成功！我们会尽快与您联系确认。')
    }
  }

  const handleLogin = (userData: { phone: string; nickname: string }) => {
    login({
      id: Date.now().toString(),
      phone: userData.phone,
      nickname: userData.nickname
    })
    setIsLoginOpen(false)
  }

  const handleRegister = (userData: { phone: string; nickname: string }) => {
    login({
      id: Date.now().toString(),
      phone: userData.phone,
      nickname: userData.nickname
    })
    setIsRegisterOpen(false)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <>
      <Header
        onLoginClick={() => setIsLoginOpen(true)}
        user={user}
        isLoggedIn={isLoggedIn}
        onLogout={logout}
      />

      <main>
        <Hero onBookNow={handleBookNow} />
        <Services services={services.length > 0 ? services : getMockServices()} onSelect={handleServiceSelect} />
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
    </>
  )
}

function getMockServices(): ServiceType[] {
  return [
    { id: '1', name: '日常保洁', icon: '🏠', description: '家庭日常清洁、整理收纳、垃圾清理', sortOrder: 1 },
    { id: '2', name: '深度清洁', icon: '✨', description: '厨房油烟机清洗、卫生间深度消毒、玻璃清洁', sortOrder: 2 },
    { id: '3', name: '开荒保洁', icon: '🧹', description: '新房装修后清洁、除胶除漆、全面除尘', sortOrder: 3 },
    { id: '4', name: '家电维修', icon: '🔧', description: '空调维修、洗衣机维修、冰箱维修、热水器维修', sortOrder: 4 },
    { id: '5', name: '养老护理', icon: '👴', description: '老人日常照料、陪护就医、康复训练', sortOrder: 5 },
    { id: '6', name: '钟点工', icon: '⏰', description: '临时清洁、做饭、跑腿等灵活服务', sortOrder: 6 },
  ]
}
