export interface User {
  id: string
  phone: string
  nickname?: string
  avatar?: string
  balance?: number
  points?: number
  couponCount?: number
  status: 'active' | 'inactive'
  createdAt: Date
}

export interface Coupon {
  id: string
  title: string
  amount: number
  minAmount: number
  expiryDate: Date
  status: 'unused' | 'used' | 'expired'
}

export interface Housekeeper {
  id: string
  userId: string
  realName: string
  avatar?: string
  idCard: string
  skills: string[]
  experience: number
  priceMin: number
  priceMax: number
  rating: number
  orderCount: number
  status: 'pending' | 'verified' | 'offline'
  description?: string
  certifications: Certification[]
  createdAt: Date
}

export interface Certification {
  id: string
  name: string
  issueDate: Date
  expiryDate?: Date
  imageUrl?: string
}

export interface ServiceType {
  id: string
  name: string
  icon: string
  description: string
  sortOrder: number
}

export interface Order {
  id: string
  orderNo: string
  userId: string
  housekeeperId: string
  housekeeper?: Housekeeper
  serviceTypeId: string
  serviceType?: ServiceType
  serviceAddress: string
  serviceTime: Date
  duration: number
  totalAmount: number
  status: OrderStatus
  remark?: string
  createdAt: Date
  completedAt?: Date
}

export type OrderStatus = 
  | 'pending_payment'
  | 'paid'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export interface Review {
  id: string
  orderId: string
  userId: string
  housekeeperId: string
  rating: number
  content?: string
  images?: string[]
  createdAt: Date
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface BookingForm {
  serviceTypeId: string
  housekeeperId?: string
  serviceAddress: string
  serviceDate: Date
  serviceTime: string
  duration: number
  remark?: string
}
