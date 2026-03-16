import { useState, useEffect } from 'react'
import { X, Calendar, Clock, User, Phone, MessageSquare, MapPin } from 'lucide-react'
import { AddressPicker } from '../AddressPicker/AddressPicker'
import type { ServiceType, TimeSlot } from '../../types/housekeeping'
import './BookingModal.css'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  service?: ServiceType
  onSubmit: (data: BookingFormData) => void
}

export interface BookingFormData {
  serviceTypeId: string
  date: string
  time: string
  duration: number
  address: string
  detailAddress: string
  contactName: string
  contactPhone: string
  remark: string
  latitude?: number
  longitude?: number
}

export function BookingModal({ isOpen, onClose, service, onSubmit }: BookingModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<BookingFormData>({
    serviceTypeId: service?.id || '',
    date: '',
    time: '09:00',
    duration: 2,
    address: '',
    detailAddress: '',
    contactName: '',
    contactPhone: '',
    remark: ''
  })

  // 同步 service 变化到表单
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        serviceTypeId: service?.id || ''
      }))
    }
  }, [isOpen, service])

  const timeSlots: TimeSlot[] = [
    { time: '08:00', available: true },
    { time: '09:00', available: true },
    { time: '10:00', available: true },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: false },
  ]

  const durations = [2, 3, 4, 6, 8]

  const handleAddressChange = (address: string, location?: { lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      address,
      latitude: location?.lat,
      longitude: location?.lng
    }))
  }

  const getFullAddress = () => {
    if (formData.detailAddress) {
      return `${formData.address} ${formData.detailAddress}`
    }
    return formData.address
  }

  const handleSubmit = () => {
    if (!formData.date) {
      alert('请选择服务日期')
      return
    }
    if (!formData.address.trim()) {
      alert('请选择服务地址')
      return
    }
    if (!formData.contactName.trim()) {
      alert('请输入联系人姓名')
      return
    }
    if (!/^1[3-9]\d{9}$/.test(formData.contactPhone)) {
      alert('请输入正确的手机号码')
      return
    }
    
    onSubmit({
      ...formData,
      address: getFullAddress()
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">预约服务</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-steps">
          <div className={`modal-step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">选择时间</span>
          </div>
          <div className="step-line"></div>
          <div className={`modal-step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">填写信息</span>
          </div>
          <div className="step-line"></div>
          <div className={`modal-step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">确认预约</span>
          </div>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="booking-step">
              {service && (
                <div className="selected-service">
                  <span className="service-icon">{service.icon}</span>
                  <span className="service-name">{service.name}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  服务日期
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  服务时间
                </label>
                <div className="time-slots">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      className={`time-slot ${formData.time === slot.time ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}`}
                      disabled={!slot.available}
                      onClick={() => setFormData({ ...formData, time: slot.time })}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  服务时长
                </label>
                <div className="duration-selector">
                  {durations.map((d) => (
                    <button
                      key={d}
                      className={`duration-btn ${formData.duration === d ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, duration: d })}
                    >
                      {d}小时
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="booking-step">
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={16} />
                  服务地址
                </label>
                <AddressPicker
                  value={formData.address}
                  onChange={handleAddressChange}
                  placeholder="请输入或选择服务地址"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  详细地址
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="请补充详细地址，如：xx小区xx栋xx单元xx号"
                  value={formData.detailAddress}
                  onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                />
                <p className="form-hint">请填写门牌号、楼层、房间号等详细信息，方便服务人员快速找到您</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <User size={16} />
                    联系人
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="您的称呼"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Phone size={16} />
                    联系电话
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="手机号码"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MessageSquare size={16} />
                  备注信息
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="如有特殊要求请备注说明"
                  rows={3}
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="booking-step booking-confirm">
              <div className="confirm-card">
                <h3 className="confirm-title">预约信息确认</h3>
                
                <div className="confirm-item">
                  <span className="confirm-label">服务类型</span>
                  <span className="confirm-value">{service?.name}</span>
                </div>
                
                <div className="confirm-item">
                  <span className="confirm-label">服务时间</span>
                  <span className="confirm-value">
                    {formData.date} {formData.time}
                  </span>
                </div>
                
                <div className="confirm-item">
                  <span className="confirm-label">服务时长</span>
                  <span className="confirm-value">{formData.duration}小时</span>
                </div>
                
                <div className="confirm-item">
                  <span className="confirm-label">服务地址</span>
                  <span className="confirm-value">{getFullAddress()}</span>
                </div>
                
                <div className="confirm-item">
                  <span className="confirm-label">联系人</span>
                  <span className="confirm-value">{formData.contactName}</span>
                </div>
                
                <div className="confirm-item">
                  <span className="confirm-label">联系电话</span>
                  <span className="confirm-value">{formData.contactPhone}</span>
                </div>

                <div className="confirm-divider"></div>

                <div className="confirm-item confirm-total">
                  <span className="confirm-label">预估费用</span>
                  <span className="confirm-price">
                    ¥{50 * formData.duration} 起
                  </span>
                </div>
                
                <p className="confirm-note">
                  * 最终价格以实际服务为准，客服将在预约确认时与您沟通具体费用
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              上一步
            </button>
          )}
          {step < 3 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
              下一步
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit}>
              确认预约
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
