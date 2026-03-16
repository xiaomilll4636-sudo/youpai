import { Filter, SortAsc } from 'lucide-react'
import type { Housekeeper } from '../../types/housekeeping'
import { HousekeeperCard } from '../HousekeeperCard/HousekeeperCard'
import './HousekeeperList.css'

interface HousekeeperListProps {
  housekeepers: Housekeeper[]
  onSelect?: (housekeeper: Housekeeper) => void
}

export function HousekeeperList({ housekeepers, onSelect }: HousekeeperListProps) {
  return (
    <section className="housekeeper-list" id="housekeepers">
      <div className="housekeeper-list-container">
        <div className="housekeeper-list-header">
          <div className="housekeeper-list-title">
            <span className="section-badge badge badge-primary">服务推荐</span>
            <h2 className="section-title">优质服务人员</h2>
            <p className="section-desc">
              严格筛选，专业培训，为您提供安心服务
            </p>
          </div>
          <div className="housekeeper-list-actions">
            <button className="btn btn-secondary btn-sm">
              <Filter size={16} />
              筛选
            </button>
            <button className="btn btn-secondary btn-sm">
              <SortAsc size={16} />
              排序
            </button>
          </div>
        </div>

        <div className="housekeeper-grid">
          {housekeepers.map((housekeeper) => (
            <HousekeeperCard
              key={housekeeper.id}
              housekeeper={housekeeper}
              onSelect={(h) => onSelect?.(h)}
            />
          ))}
        </div>

        <div className="housekeeper-list-footer">
          <button className="btn btn-outline">
            查看更多服务
          </button>
        </div>
      </div>
    </section>
  )
}
