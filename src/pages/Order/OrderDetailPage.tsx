import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  ShieldCheck, 
  AlertCircle,
  Truck,
  CheckCircle2,
  Package,
} from 'lucide-react'
import type { Order } from '../../types/housekeeping'
import './OrderDetailPage.css'

export function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrderDetail()
  }, [id])

  const loadOrderDetail = async () => {
    try {
      setLoading(true)
      // 在实际项目中这里会调用 api.getDetail(id)
      // 这里我们直接用 mock 数据
      const mockOrder = getMockOrderDetail(id || '1')
      setOrder(mockOrder)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="detail-loading">加载中...</div>
  if (!order) return <div className="detail-error">订单不存在</div>

  const steps = [
    { title: '已下单', time: '2024-03-15 08:30', desc: '您的预约已提交，等待后台审核', status: 'completed', icon: Package },
    { title: '已支付', time: '2024-03-15 08:35', desc: '订单支付成功，正在为您分配阿姨', status: 'completed', icon: ShieldCheck },
    { title: '已接单', time: '2024-03-16 09:00', desc: '王大姐已接单，将于预约时间准时到达', status: order.status === 'completed' || order.status === 'in_service' ? 'completed' : 'active', icon: User },
    { title: order.status === 'completed' ? '服务完成' : '服务中', time: order.status === 'completed' ? '2024-03-16 12:00' : '预计 09:00 开始', desc: order.status === 'completed' ? '阿姨已完成全部服务项目' : '服务进行中，如有问题请联系平台', status: order.status === 'completed' ? 'completed' : (order.status === 'in_service' ? 'active' : 'pending'), icon: CheckCircle2 },
  ]

  return (
    <div className="order-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1>订单详情</h1>
      </div>

      <div className="status-banner" style={{ background: order.status === 'completed' ? '#10B981' : '#3B82F6' }}>
        <div className="status-main">
          <h2>{order.status === 'completed' ? '服务已完成' : '订单追踪中'}</h2>
          <p>订单号: {order.orderNo}</p>
        </div>
        <div className="status-icon">
          {order.status === 'completed' ? <CheckCircle2 size={48} /> : <Truck size={48} />}
        </div>
      </div>

      <div className="detail-section">
        <h3 className="section-title">服务进程</h3>
        <div className="tracking-timeline">
          {steps.map((step, idx) => (
            <div key={idx} className={`timeline-item ${step.status}`}>
              <div className="timeline-node">
                <step.icon size={16} />
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <h4>{step.title}</h4>
                  <span className="time">{step.time}</span>
                </div>
                <p className="desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-section">
        <h3 className="section-title">服务信息</h3>
        <div className="info-card">
          <div className="info-item">
            <span className="label">服务项目</span>
            <span className="value">{order.serviceType?.name}</span>
          </div>
          <div className="info-item">
            <span className="label">预约时间</span>
            <span className="value">{new Date(order.serviceTime).toLocaleString()}</span>
          </div>
          <div className="info-item">
            <span className="label">服务地址</span>
            <span className="value">{order.serviceAddress}</span>
          </div>
          <div className="info-item">
            <span className="label">服务时长</span>
            <span className="value">{order.duration} 小时</span>
          </div>
        </div>
      </div>

      {order.housekeeper && (
        <div className="detail-section">
          <h3 className="section-title">服务人员</h3>
          <div className="housekeeper-card">
            <img src={order.housekeeper.avatar} alt="avatar" />
            <div className="hk-main">
              <h4>{order.housekeeper.realName}</h4>
              <div className="hk-tags">
                <span>经验 {order.housekeeper.experience}年</span>
                <span>评分 {order.housekeeper.rating}</span>
              </div>
            </div>
            <button className="call-btn" onClick={() => window.location.href='tel:13392983782'}>
              <Phone size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="detail-section">
        <h3 className="section-title">费用明细</h3>
        <div className="price-card">
          <div className="price-row">
            <span>服务费用</span>
            <span>¥{order.totalAmount}</span>
          </div>
          <div className="price-row">
            <span>优惠折扣</span>
            <span className="discount">-¥0.00</span>
          </div>
          <div className="price-row total">
            <span>实付款</span>
            <span className="final-price">¥{order.totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="detail-notice">
        <AlertCircle size={16} />
        <p>如需申请售后或退款，请在服务结束后24小时内联系客服。</p>
      </div>

      <div className="sticky-actions">
        {order.status === 'completed' ? (
          <button className="primary-action-btn">评价服务</button>
        ) : (
          <button className="primary-action-btn">联系客服</button>
        )}
        <button className="secondary-action-btn">再次预约</button>
      </div>
    </div>
  )
}

function getMockOrderDetail(id: string): Order {
  return {
    id,
    orderNo: 'YP20240315' + id.padStart(4, '0'),
    userId: 'u1',
    housekeeperId: 'h1',
    serviceTypeId: '1',
    serviceAddress: '北京市朝阳区建国路88号 SOHO现代城',
    serviceTime: new Date('2024-03-16 09:00:00'),
    duration: 3,
    totalAmount: 156,
    status: id === '2' ? 'in_service' : 'completed',
    createdAt: new Date('2024-03-15 08:30:00'),
    serviceType: { id: '1', name: '日常保洁', icon: '🏠', description: '', sortOrder: 1 },
    housekeeper: { 
      id: 'h1', userId: 'w1', realName: '王大姐', rating: 4.8, status: 'verified', experience: 5, priceMin: 50, priceMax: 80, idCard: '', 
      certifications: [], createdAt: new Date(), avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=王',
      skills: ['日常保洁', '做饭'], orderCount: 120
    }
  }
}
