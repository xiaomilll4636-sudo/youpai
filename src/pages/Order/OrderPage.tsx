import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, ChevronRight, Star } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import type { Order } from '../../types/housekeeping'
import './OrderPage.css'

type OrderTab = 'all' | 'pending' | 'in_service' | 'completed'

export function OrderPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<OrderTab>('all')

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/')
      return
    }
    loadOrders()
  }, [isLoggedIn, activeTab])

  const loadOrders = async () => {
    try {
      setLoading(true)
      // 模拟网络延迟并直接加载模拟数据，避免触发全局 401 拦截
      await new Promise(resolve => setTimeout(resolve, 500))
      setOrders(getMockOrders(activeTab))
    } catch (error) {
      console.error('Failed to load orders:', error)
      setOrders(getMockOrders(activeTab))
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      pending_payment: { label: '待支付', color: '#F59E0B', icon: Clock },
      paid: { label: '已支付', color: '#3B82F6', icon: CheckCircle },
      in_service: { label: '服务中', color: '#10B981', icon: Clock },
      completed: { label: '已完成', color: '#6B7280', icon: CheckCircle },
      cancelled: { label: '已取消', color: '#EF4444', icon: XCircle },
    }
    return configs[status] || configs.completed
  }

  const tabs: { key: OrderTab; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待处理' },
    { key: 'in_service', label: '进行中' },
    { key: 'completed', label: '已完成' },
  ]

  return (
    <div className="order-page">
      <div className="order-header">
        <h1>我的订单</h1>
      </div>

      <div className="order-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`order-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="order-list">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : orders.length === 0 ? (
          <div className="empty">
            <p>暂无订单</p>
          </div>
        ) : (
          orders.map((order) => {
            const statusConfig = getStatusConfig(order.status)
            const StatusIcon = statusConfig.icon
            return (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <span className="order-no">订单号: {order.orderNo}</span>
                  <span className="order-status" style={{ color: statusConfig.color }}>
                    <StatusIcon size={14} />
                    {statusConfig.label}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-service">
                    <span className="service-icon">
                      {order.serviceType?.icon || '🏠'}
                    </span>
                    <div className="service-info">
                      <h3>{order.serviceType?.name || '家政服务'}</h3>
                      <p>{order.serviceAddress}</p>
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="detail-item">
                      <span className="label">服务时间</span>
                      <span className="value">
                        {new Date(order.serviceTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">服务时长</span>
                      <span className="value">{order.duration}小时</span>
                    </div>
                  </div>
                </div>

                <div className="order-card-footer">
                  <div className="order-amount">
                    合计: <span className="price">¥{order.totalAmount}</span>
                  </div>
                  <div className="order-actions">
                    {order.status === 'completed' && (
                      <button className="btn btn-outline btn-sm">
                        <Star size={14} />
                        评价
                      </button>
                    )}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      查看详情
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function getMockOrders(tab: OrderTab): Order[] {
  const allOrders: Order[] = [
    {
      id: '1', orderNo: 'YP202401010001', userId: 'u1', housekeeperId: 'h1',
      serviceTypeId: '1', serviceAddress: '北京市朝阳区建国路88号',
      serviceTime: new Date('2024-03-15 09:00:00'), duration: 3,
      totalAmount: 156, status: 'completed',
      createdAt: new Date(), 
      serviceType: { id: '1', name: '日常保洁', icon: '🏠', description: '', sortOrder: 1 },
      housekeeper: { 
        id: 'h1', userId: 'w1', realName: '王大姐', rating: 4.8, status: 'verified', experience: 5, priceMin: 50, priceMax: 80, idCard: '', 
        certifications: [], createdAt: new Date(), avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=王',
        skills: ['日常保洁', '做饭'], orderCount: 120
      }
    },
    {
      id: '2', orderNo: 'YP202401010002', userId: 'u1', housekeeperId: 'h2',
      serviceTypeId: '2', serviceAddress: '北京市海淀区中关村大街1号',
      serviceTime: new Date('2024-03-16 14:00:00'), duration: 4,
      totalAmount: 320, status: 'in_service',
      createdAt: new Date(), 
      serviceType: { id: '2', name: '深度清洁', icon: '✨', description: '', sortOrder: 2 },
      housekeeper: { 
        id: 'h2', userId: 'w2', realName: '李阿姨', rating: 4.9, status: 'verified', experience: 8, priceMin: 80, priceMax: 120, idCard: '', 
        certifications: [], createdAt: new Date(), avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=李',
        skills: ['深度清洁', '收纳'], orderCount: 250
      }
    },
    {
      id: '3', orderNo: 'YP202401010003', userId: 'u1', housekeeperId: 'h3',
      serviceTypeId: '4', serviceAddress: '北京市西城区金融街10号',
      serviceTime: new Date('2024-03-18 10:00:00'), duration: 2,
      totalAmount: 160, status: 'pending_payment',
      createdAt: new Date(), 
      serviceType: { id: '4', name: '家电维修', icon: '🔧', description: '', sortOrder: 4 }
    },
  ]

  if (tab === 'all') return allOrders
  if (tab === 'pending') return allOrders.filter(o => o.status === 'pending_payment')
  if (tab === 'in_service') return allOrders.filter(o => o.status === 'in_service')
  if (tab === 'completed') return allOrders.filter(o => o.status === 'completed')
  return allOrders
}
