import { AdminLayout } from './AdminLayout'
import { TrendingUp, TrendingDown, Users, FileText, DollarSign, Clock } from 'lucide-react'
import './Dashboard.css'

export function AdminDashboard() {
  const stats = [
    { 
      label: '今日订单', 
      value: '156', 
      change: '+12%', 
      trend: 'up', 
      icon: FileText,
      color: '#1890ff'
    },
    { 
      label: '活跃用户', 
      value: '2,345', 
      change: '+8%', 
      trend: 'up', 
      icon: Users,
      color: '#52c41a'
    },
    { 
      label: '今日收入', 
      value: '¥23,456', 
      change: '+15%', 
      trend: 'up', 
      icon: DollarSign,
      color: '#faad14'
    },
    { 
      label: '待处理订单', 
      value: '23', 
      change: '-5%', 
      trend: 'down', 
      icon: Clock,
      color: '#ff4d4f'
    },
  ]

  const recentOrders = [
    { id: 'YP20240101001', user: '张三', service: '日常保洁', amount: 150, status: 'pending' },
    { id: 'YP20240101002', user: '李四', service: '深度清洁', amount: 320, status: 'in_service' },
    { id: 'YP20240101003', user: '王五', service: '家电维修', amount: 200, status: 'completed' },
    { id: 'YP20240101004', user: '赵六', service: '开荒保洁', amount: 500, status: 'completed' },
    { id: 'YP20240101005', user: '钱七', service: '钟点工', amount: 80, status: 'cancelled' },
  ]

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: '待处理', className: 'badge-warning' },
      in_service: { label: '服务中', className: 'badge-primary' },
      completed: { label: '已完成', className: 'badge-success' },
      cancelled: { label: '已取消', className: 'badge-error' },
    }
    return badges[status] || { label: status, className: '' }
  }

  return (
    <AdminLayout activeMenu="dashboard">
      <div className="dashboard">
        <h1 className="page-title">数据概览</h1>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className={`stat-change ${stat.trend}`}>
                  {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>最近订单</h3>
              <button className="view-all-btn">查看全部</button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>用户</th>
                    <th>服务</th>
                    <th>金额</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const badge = getStatusBadge(order.status)
                    return (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.user}</td>
                        <td>{order.service}</td>
                        <td>¥{order.amount}</td>
                        <td>
                          <span className={`badge ${badge.className}`}>{badge.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3>服务分布</h3>
            </div>
            <div className="service-chart">
              <div className="chart-item">
                <span className="chart-label">日常保洁</span>
                <div className="chart-bar">
                  <div className="chart-fill" style={{ width: '45%', background: '#1890ff' }}></div>
                </div>
                <span className="chart-value">45%</span>
              </div>
              <div className="chart-item">
                <span className="chart-label">深度清洁</span>
                <div className="chart-bar">
                  <div className="chart-fill" style={{ width: '25%', background: '#52c41a' }}></div>
                </div>
                <span className="chart-value">25%</span>
              </div>
              <div className="chart-item">
                <span className="chart-label">家电维修</span>
                <div className="chart-bar">
                  <div className="chart-fill" style={{ width: '15%', background: '#faad14' }}></div>
                </div>
                <span className="chart-value">15%</span>
              </div>
              <div className="chart-item">
                <span className="chart-label">其他</span>
                <div className="chart-bar">
                  <div className="chart-fill" style={{ width: '15%', background: '#ff4d4f' }}></div>
                </div>
                <span className="chart-value">15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
