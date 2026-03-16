import { useState, useRef, useEffect } from 'react'
import { X, MapPin, Search, Navigation, Loader2 } from 'lucide-react'
import './AddressPicker.css'

interface AddressPickerProps {
  value: string
  onChange: (address: string, location?: { lat: number; lng: number }) => void
  placeholder?: string
}

interface AddressSuggestion {
  name: string
  address: string
  lat?: number
  lng?: number
  district?: string
}

export function AddressPicker({ value, onChange, placeholder = '请输入或选择服务地址' }: AddressPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchText, setSearchText] = useState(value)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [recentAddresses, setRecentAddresses] = useState<AddressSuggestion[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('recentAddresses')
    if (saved) {
      setRecentAddresses(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchAddress = async (keyword: string) => {
    if (!keyword.trim()) {
      setSuggestions([])
      return
    }

    setLoading(true)
    
    const mockData: AddressSuggestion[] = [
      { name: 'SOHO现代城', address: '北京市朝阳区建国路88号SOHO现代城', district: '朝阳区' },
      { name: '海龙大厦', address: '北京市海淀区中关村大街1号海龙大厦', district: '海淀区' },
      { name: '金融街', address: '北京市西城区金融街10号', district: '西城区' },
      { name: '万达广场', address: '北京市朝阳区建国路93号万达广场', district: '朝阳区' },
      { name: '国贸中心', address: '北京市朝阳区建国门外大街1号国贸中心', district: '朝阳区' },
      { name: '望京SOHO', address: '北京市朝阳区望京街10号望京SOHO', district: '朝阳区' },
      { name: '中关村软件园', address: '北京市海淀区中关村软件园', district: '海淀区' },
      { name: '西单大悦城', address: '北京市西城区西单北大街131号大悦城', district: '西城区' },
      { name: '三里屯太古里', address: '北京市朝阳区三里屯路19号太古里', district: '朝阳区' },
      { name: '望京花园', address: '北京市朝阳区望京街望京花园', district: '朝阳区' },
    ]
    
    const results = mockData.filter(item => 
      item.name.includes(keyword) || 
      item.address.includes(keyword) ||
      item.district?.includes(keyword)
    ).slice(0, 5)
    
    setTimeout(() => {
      setSuggestions(results)
      setLoading(false)
    }, 200)
  }

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=zh`,
        {
          headers: {
            'Accept-Language': 'zh-CN,zh;q=0.9'
          }
        }
      )
      const data = await response.json()
      if (data && data.display_name) {
        const parts = data.display_name.split(',').reverse()
        const formatted = parts.slice(0, 4).join('')
        return formatted.replace(/,/g, '')
      }
      return ''
    } catch (error) {
      console.error('逆地理编码失败:', error)
      return ''
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('您的浏览器不支持定位功能，请手动输入地址')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const addressText = await reverseGeocode(latitude, longitude)
        
        if (addressText) {
          setSearchText(addressText)
          onChange(addressText, { lat: latitude, lng: longitude })
        } else {
          setSearchText('')
          onChange('', { lat: latitude, lng: longitude })
          alert('定位成功！请在下方"详细地址"栏填写您的具体位置')
        }
        
        setIsOpen(false)
        setLocating(false)
      },
      () => {
        setLocating(false)
        alert('获取位置失败，请手动输入地址')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const selectAddress = (address: AddressSuggestion) => {
    setSearchText(address.address)
    onChange(address.address, address.lat && address.lng ? { lat: address.lat, lng: address.lng } : undefined)
    setIsOpen(false)
    
    const newRecent = [address, ...recentAddresses.filter(a => a.address !== address.address)].slice(0, 5)
    setRecentAddresses(newRecent)
    localStorage.setItem('recentAddresses', JSON.stringify(newRecent))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setSearchText(text)
    onChange(text)
    setIsOpen(true)
    
    clearTimeout((window as any).searchTimeout)
    ;(window as any).searchTimeout = setTimeout(() => {
      searchAddress(text)
    }, 300)
  }

  const handleFocus = () => {
    setIsOpen(true)
    if (searchText) {
      searchAddress(searchText)
    }
  }

  return (
    <div className="address-picker" ref={dropdownRef}>
      <div className="address-input-wrapper">
        <MapPin size={18} className="address-icon" />
        <input
          type="text"
          className="address-input"
          placeholder={placeholder}
          value={searchText}
          onChange={handleInputChange}
          onFocus={handleFocus}
        />
        {searchText && (
          <button 
            className="address-clear" 
            onClick={() => {
              setSearchText('')
              onChange('')
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="address-dropdown">
          <div className="address-locate" onClick={getCurrentLocation}>
            {locating ? (
              <Loader2 size={18} className="spinning" />
            ) : (
              <Navigation size={18} />
            )}
            <span>{locating ? '定位中...' : '使用当前位置'}</span>
          </div>

          {searchText && suggestions.length > 0 && (
            <div className="address-section">
              <div className="address-section-title">搜索结果</div>
              {suggestions.map((item, index) => (
                <div
                  key={index}
                  className="address-item"
                  onClick={() => selectAddress(item)}
                >
                  <MapPin size={16} className="item-icon" />
                  <div className="item-content">
                    <div className="item-name">{item.name}</div>
                    <div className="item-address">{item.address}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searchText && recentAddresses.length > 0 && (
            <div className="address-section">
              <div className="address-section-title">最近使用</div>
              {recentAddresses.map((item, index) => (
                <div
                  key={index}
                  className="address-item"
                  onClick={() => selectAddress(item)}
                >
                  <MapPin size={16} className="item-icon" />
                  <div className="item-content">
                    <div className="item-name">{item.name}</div>
                    <div className="item-address">{item.address}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchText && !loading && suggestions.length === 0 && (
            <div className="address-empty">
              <Search size={24} />
              <p>未找到相关地址</p>
              <span>请尝试其他关键词</span>
            </div>
          )}

          {loading && (
            <div className="address-loading">
              <Loader2 size={24} className="spinning" />
              <p>搜索中...</p>
            </div>
          )}

          <div className="address-tips">
            <p>提示：输入小区名、街道名或地标建筑</p>
          </div>
        </div>
      )}
    </div>
  )
}
