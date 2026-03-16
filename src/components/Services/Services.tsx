import { ArrowRight } from 'lucide-react'
import type { ServiceType } from '../../types/housekeeping'
import './Services.css'

interface ServicesProps {
  services: ServiceType[]
  onSelect?: (service: ServiceType) => void
}

export function Services({ services, onSelect }: ServicesProps) {
  return (
    <section className="services" id="services">
      <div className="services-container">
        <div className="services-header">
          <span className="section-badge badge badge-primary">服务项目</span>
          <h2 className="section-title">专业家政服务</h2>
          <p className="section-desc">
            我们提供全方位的家政服务，满足您不同的生活需求
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="service-card"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onSelect?.(service)}
            >
              <div className="service-icon">
                <span>{service.icon}</span>
              </div>
              <h3 className="service-name">{service.name}</h3>
              <p className="service-desc">{service.description}</p>
              <div className="service-action">
                <span>立即预约</span>
                <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
