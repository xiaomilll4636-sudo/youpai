import { create } from 'zustand'
import type { User, Housekeeper, Order, ServiceType } from '../types/housekeeping'

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  
  cart: {
    serviceType: ServiceType | null
    housekeeper: Housekeeper | null
    date: Date | null
    time: string
    duration: number
    address: string
    remark: string
  }
  setCartServiceType: (serviceType: ServiceType | null) => void
  setCartHousekeeper: (housekeeper: Housekeeper | null) => void
  setCartDate: (date: Date | null) => void
  setCartTime: (time: string) => void
  setCartDuration: (duration: number) => void
  setCartAddress: (address: string) => void
  setCartRemark: (remark: string) => void
  resetCart: () => void
  
  orders: Order[]
  addOrder: (order: Order) => void
}

const initialCart = {
  serviceType: null,
  housekeeper: null,
  date: null,
  time: '09:00',
  duration: 2,
  address: '',
  remark: ''
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  cart: initialCart,
  setCartServiceType: (serviceType) => set((state) => ({ 
    cart: { ...state.cart, serviceType } 
  })),
  setCartHousekeeper: (housekeeper) => set((state) => ({ 
    cart: { ...state.cart, housekeeper } 
  })),
  setCartDate: (date) => set((state) => ({ 
    cart: { ...state.cart, date } 
  })),
  setCartTime: (time) => set((state) => ({ 
    cart: { ...state.cart, time } 
  })),
  setCartDuration: (duration) => set((state) => ({ 
    cart: { ...state.cart, duration } 
  })),
  setCartAddress: (address) => set((state) => ({ 
    cart: { ...state.cart, address } 
  })),
  setCartRemark: (remark) => set((state) => ({ 
    cart: { ...state.cart, remark } 
  })),
  resetCart: () => set({ cart: initialCart }),
  
  orders: [],
  addOrder: (order) => set((state) => ({ 
    orders: [order, ...state.orders] 
  }))
}))
