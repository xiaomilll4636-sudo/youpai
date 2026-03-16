import { Star, MapPin, Briefcase, ChevronRight, User } from 'lucide-react'
import type { Housekeeper } from '../../types/housekeeping'
import './HousekeeperCard.css'

interface HousekeeperCardProps {
  housekeeper: Housekeeper
  onSelect?: (housekeeper: Housekeeper) => void
}

export function HousekeeperCard({ housekeeper, onSelect }: HousekeeperCardProps) {
  const formatPrice = (min: number, max: number) => {
    if (min === max) return `¥${min}/小时`
    return `¥${min}-${max}/小时`
  }

  return (
    <div className="housekeeper-card" onClick={() => onSelect?.(housekeeper)}>
      <div className="housekeeper-header">
        <div className="housekeeper-avatar">
          <User size={28} />
          {housekeeper.status === 'verified' && (
            <div className="housekeeper-verified">✓</div>
          )}
        </div>
        <div className="housekeeper-info">
          <h3 className="housekeeper-name">{housekeeper.realName}</h3>
          <div className="housekeeper-meta">
            <div className="housekeeper-rating">
              <Star size={14} fill="currentColor" />
              <span>{housekeeper.rating.toFixed(1)}</span>
            </div>
            <span className="housekeeper-orders">
              已服务 {housekeeper.orderCount} 单
            </span>
          </div>
        </div>
      </div>

      <div className="housekeeper-skills">
        {housekeeper.skills.slice(0, 3).map((skill, index) => (
          <span key={index} className="skill-tag">
            {skill}
          </span>
        ))}
        {housekeeper.skills.length > 3 && (
          <span className="skill-tag skill-more">
            +{housekeeper.skills.length - 3}
          </span>
        )}
      </div>

      <p className="housekeeper-desc">
        {housekeeper.description || `${housekeeper.experience}年从业经验，专业可靠，服务周到`}
      </p>

      <div className="housekeeper-details">
        <div className="housekeeper-detail">
          <Briefcase size={14} />
          <span>{housekeeper.experience}年经验</span>
        </div>
        <div className="housekeeper-detail">
          <MapPin size={14} />
          <span>服务全城</span>
        </div>
      </div>

      <div className="housekeeper-footer">
        <div className="housekeeper-price">
          {formatPrice(housekeeper.priceMin, housekeeper.priceMax)}
        </div>
        <button className="btn btn-primary btn-sm">
          立即预约
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
