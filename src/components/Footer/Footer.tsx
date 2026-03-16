import { Phone, Mail, MapPin, MessageSquare, MessageCircle } from 'lucide-react'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">优</span>
              <div className="logo-text">
                <span className="logo-name">优派管家</span>
                <span className="logo-slogan">专业家政服务</span>
              </div>
            </div>
            <p className="footer-desc">
              优派管家致力于为每个家庭提供专业、可靠、高品质的家政服务。
              我们严格筛选每一位服务人员，确保服务的专业性和安全性。
            </p>
            <div className="footer-contact">
              <div className="contact-item">
                <Phone size={16} />
                <span>133-9298-3782</span>
              </div>
              <div className="contact-item">
                <Mail size={16} />
                <span>service@youpai.com</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>北京市朝阳区建国路88号</span>
              </div>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-title">服务项目</h4>
              <ul className="footer-list">
                <li><a href="#">日常保洁</a></li>
                <li><a href="#">深度清洁</a></li>
                <li><a href="#">月嫂服务</a></li>
                <li><a href="#">育儿嫂</a></li>
                <li><a href="#">养老护理</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">关于我们</h4>
              <ul className="footer-list">
                <li><a href="#">公司介绍</a></li>
                <li><a href="#">服务保障</a></li>
                <li><a href="#">加入我们</a></li>
                <li><a href="#">合作加盟</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">帮助中心</h4>
              <ul className="footer-list">
                <li><a href="#">常见问题</a></li>
                <li><a href="#">服务协议</a></li>
                <li><a href="#">隐私政策</a></li>
                <li><a href="#">投诉建议</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">联系我们</h4>
              <div className="footer-qrcode">
                <div className="qrcode-placeholder">
                  <MessageSquare size={24} />
                  <span>微信客服</span>
                </div>
                <div className="qrcode-placeholder">
                  <MessageCircle size={24} />
                  <span>在线咨询</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © 2024 优派管家服务有限公司 版权所有
          </p>
          <p className="icp">
            京ICP备12345678号-1
          </p>
        </div>
      </div>
    </footer>
  )
}
