-- ============================================
-- 优派管家服务 - 数据库架构设计
-- Database Architect: Optimized for Performance
-- ============================================

-- 启用扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 用于模糊搜索

-- ============================================
-- 用户表 (Users)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(500),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 用户表索引
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ============================================
-- 服务类型表 (Service Types)
-- ============================================
CREATE TABLE service_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL DEFAULT 'hour', -- hour, session, day
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 服务类型索引
CREATE INDEX idx_service_types_sort ON service_types(sort_order) WHERE is_active = true;
CREATE INDEX idx_service_types_active ON service_types(is_active);

-- ============================================
-- 阿姨/服务人员表 (Housekeepers)
-- ============================================
CREATE TABLE housekeepers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    real_name VARCHAR(50) NOT NULL,
    id_card VARCHAR(18) NOT NULL, -- 加密存储
    id_card_hash VARCHAR(64) NOT NULL, -- 用于唯一性校验
    avatar VARCHAR(500),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    birth_date DATE,
    phone VARCHAR(20) NOT NULL,
    emergency_contact VARCHAR(50),
    emergency_phone VARCHAR(20),
    
    -- 服务信息
    skills TEXT[] NOT NULL DEFAULT '{}',
    experience_years INTEGER NOT NULL DEFAULT 0,
    service_areas TEXT[] NOT NULL DEFAULT '{}',
    price_min DECIMAL(10,2) NOT NULL,
    price_max DECIMAL(10,2) NOT NULL,
    
    -- 统计信息
    rating DECIMAL(2,1) NOT NULL DEFAULT 5.0,
    order_count INTEGER NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    
    -- 状态
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'offline')),
    verified_at TIMESTAMPTZ,
    
    -- 简介
    description TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT chk_price_range CHECK (price_min <= price_max)
);

-- 阿姨表索引
CREATE INDEX idx_housekeepers_user ON housekeepers(user_id);
CREATE INDEX idx_housekeepers_status ON housekeepers(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_housekeepers_rating ON housekeepers(rating DESC) WHERE status = 'verified' AND deleted_at IS NULL;
CREATE INDEX idx_housekeepers_price ON housekeepers(price_min, price_max) WHERE status = 'verified' AND deleted_at IS NULL;
CREATE INDEX idx_housekeepers_skills ON housekeepers USING GIN(skills);
CREATE INDEX idx_housekeepers_areas ON housekeepers USING GIN(service_areas);
CREATE INDEX idx_housekeepers_name_trgm ON housekeepers USING GIN(real_name gin_trgm_ops);

-- ============================================
-- 阿姨认证表 (Certifications)
-- ============================================
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    housekeeper_id UUID NOT NULL REFERENCES housekeepers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    issuer VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    image_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_certifications_housekeeper ON certifications(housekeeper_id);
CREATE INDEX idx_certifications_status ON certifications(status);

-- ============================================
-- 订单表 (Orders)
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(32) UNIQUE NOT NULL,
    
    -- 关联
    user_id UUID NOT NULL REFERENCES users(id),
    housekeeper_id UUID REFERENCES housekeepers(id),
    service_type_id UUID NOT NULL REFERENCES service_types(id),
    
    -- 服务信息
    service_address VARCHAR(255) NOT NULL,
    service_lat DECIMAL(10, 8),
    service_lng DECIMAL(11, 8),
    service_date DATE NOT NULL,
    service_time TIME NOT NULL,
    duration INTEGER NOT NULL DEFAULT 2, -- 小时
    
    -- 金额
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    
    -- 状态
    status VARCHAR(20) NOT NULL DEFAULT 'pending_payment' CHECK (
        status IN ('pending_payment', 'paid', 'confirmed', 'in_service', 'completed', 'cancelled', 'refunded')
    ),
    
    -- 支付信息
    payment_method VARCHAR(20),
    payment_time TIMESTAMPTZ,
    transaction_id VARCHAR(100),
    
    -- 备注
    remark TEXT,
    cancel_reason TEXT,
    
    -- 时间戳
    confirmed_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 订单表索引
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_housekeeper ON orders(housekeeper_id);
CREATE INDEX idx_orders_service_type ON orders(service_type_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(service_date, service_time);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_no ON orders(order_no);

-- ============================================
-- 评价表 (Reviews)
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    housekeeper_id UUID NOT NULL REFERENCES housekeepers(id),
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    images TEXT[],
    tags TEXT[],
    
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    reply TEXT,
    reply_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(order_id) -- 一个订单只能评价一次
);

-- 评价表索引
CREATE INDEX idx_reviews_housekeeper ON reviews(housekeeper_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

-- ============================================
-- 收藏表 (Favorites)
-- ============================================
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    housekeeper_id UUID NOT NULL REFERENCES housekeepers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, housekeeper_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_housekeeper ON favorites(housekeeper_id);

-- ============================================
-- 地址表 (Addresses)
-- ============================================
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    address VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    is_default BOOLEAN NOT NULL DEFAULT false,
    tag VARCHAR(20), -- home, company, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id) WHERE is_default = true;

-- ============================================
-- 阿姨日程表 (Schedules)
-- ============================================
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    housekeeper_id UUID NOT NULL REFERENCES housekeepers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
    order_id UUID REFERENCES orders(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(housekeeper_id, date, start_time, end_time)
);

CREATE INDEX idx_schedules_housekeeper ON schedules(housekeeper_id, date);
CREATE INDEX idx_schedules_date ON schedules(date) WHERE status = 'available';

-- ============================================
-- 通知表 (Notifications)
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    data JSONB,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- 触发器: 自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_housekeepers_updated_at BEFORE UPDATE ON housekeepers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 触发器: 更新阿姨评分
-- ============================================
CREATE OR REPLACE FUNCTION update_housekeeper_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE housekeepers
    SET 
        rating = (SELECT AVG(rating)::DECIMAL(2,1) FROM reviews WHERE housekeeper_id = NEW.housekeeper_id),
        review_count = (SELECT COUNT(*) FROM reviews WHERE housekeeper_id = NEW.housekeeper_id)
    WHERE id = NEW.housekeeper_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rating_after_review
AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_housekeeper_rating();

-- ============================================
-- 触发器: 更新阿姨订单数
-- ============================================
CREATE OR REPLACE FUNCTION update_housekeeper_order_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE housekeepers SET order_count = order_count + 1 WHERE id = NEW.housekeeper_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE housekeepers SET order_count = order_count - 1 WHERE id = OLD.housekeeper_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_order_count
AFTER INSERT OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_housekeeper_order_count();

-- ============================================
-- 初始数据: 服务类型
-- ============================================
INSERT INTO service_types (name, icon, description, base_price, unit, sort_order) VALUES
('日常保洁', '🏠', '家庭日常清洁、整理收纳、垃圾清理', 50, 'hour', 1),
('深度清洁', '✨', '厨房油烟机清洗、卫生间深度消毒、玻璃清洁', 80, 'hour', 2),
('月嫂服务', '👶', '产妇护理、新生儿照护、营养餐制作', 200, 'day', 3),
('育儿嫂', '🧸', '婴幼儿护理、辅食添加、早教启蒙', 150, 'day', 4),
('养老护理', '👴', '老人日常照料、陪护就医、康复训练', 120, 'day', 5),
('钟点工', '⏰', '临时清洁、做饭、跑腿等灵活服务', 45, 'hour', 6);
