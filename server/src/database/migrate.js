require('dotenv').config();
const { pool } = require('./index');
const logger = require('../utils/logger');

const DROP_TABLES = `
  DROP TABLE IF EXISTS schedules CASCADE;
  DROP TABLE IF EXISTS reviews CASCADE;
  DROP TABLE IF EXISTS order_logs CASCADE;
  DROP TABLE IF EXISTS orders CASCADE;
  DROP TABLE IF EXISTS service_types CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  DROP TABLE IF EXISTS housekeepers CASCADE;
`;

const CREATE_TABLES = `
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    gender VARCHAR(10),
    role VARCHAR(20) DEFAULT 'user', -- 'user' or 'admin' 
    status VARCHAR(20) DEFAULT 'active',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
  );

  CREATE TABLE housekeepers (
    id SERIAL PRIMARY KEY,
    real_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    avatar VARCHAR(255),
    gender VARCHAR(10),
    skills TEXT[],
    experience_years INTEGER DEFAULT 0,
    price_min DECIMAL(10,2) DEFAULT 0.00,
    price_max DECIMAL(10,2) DEFAULT 0.00,
    rating DECIMAL(2,1) DEFAULT 5.0,
    order_count INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    description TEXT,
    service_areas TEXT[],
    status VARCHAR(20) DEFAULT 'available', -- available, busy, offline, verified
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
  );

  CREATE TABLE service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT '小时',
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
  );

  CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    service_type_id INTEGER REFERENCES service_types(id),
    housekeeper_id INTEGER REFERENCES housekeepers(id),
    status VARCHAR(50) DEFAULT 'pending_payment', -- pending_payment, paid, confirmed, in_progress, completed, cancelled
    service_address TEXT NOT NULL,
    service_lat DECIMAL(10,6),
    service_lng DECIMAL(10,6),
    service_date DATE NOT NULL,
    service_time VARCHAR(10) NOT NULL,
    duration INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,
    remark TEXT,
    cancel_reason TEXT,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
  );

  CREATE TABLE order_logs (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    user_id INTEGER REFERENCES users(id),
    housekeeper_id INTEGER REFERENCES housekeepers(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    images JSONB,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    housekeeper_id INTEGER REFERENCES housekeepers(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'available', -- available, booked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const SEED_DATA = `
  INSERT INTO service_types (name, description, base_price, unit, icon, sort_order) VALUES
  ('日常保洁', '家庭日常清洁，包含客厅、卧室、厨房、卫生间表面清洁。', 120.00, '小时', 'Sparkles', 1),
  ('深度保洁', '全屋深度清洁，包含死角、顽固污渍处理。', 280.00, '小时', 'Droplets', 2),
  ('家电维修', '各类家用电器故障检测与维修。', 100.00, '次', 'Wrench', 3),
  ('开荒保洁', '新房或装修后全面彻底的开荒清洁。', 450.00, '次', 'Home', 4),
  ('管道疏通', '厨房下水道、马桶等各类管道疏通。', 80.00, '次', 'Wrench', 5),
  ('家电清洗', '空调、洗衣机、油烟机等家电专业拆洗。', 150.00, '台', 'Wind', 6);

  INSERT INTO housekeepers (real_name, phone, rating, status, skills, description) VALUES
  ('张师傅', '13800138001', 4.9, 'verified', ARRAY['深度保洁', '日常保洁'], '专业保洁10年经验。'),
  ('李阿姨', '13800138002', 4.8, 'verified', ARRAY['日常保洁'], '干事麻利，好评如潮。'),
  ('王师傅', '13800138003', 4.7, 'verified', ARRAY['家电清洗', '管道疏通'], '各类家电都能洗。');
`;

async function migrate() {
  const client = await pool.connect();
  try {
    logger.info('Starting database migration...');
    
    await client.query('BEGIN');
    
    logger.info('Dropping existing tables...');
    await client.query(DROP_TABLES);
    
    logger.info('Creating tables...');
    await client.query(CREATE_TABLES);
    
    logger.info('Seeding initial data...');
    await client.query(SEED_DATA);
    
    await client.query('COMMIT');
    logger.info('Database migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Database migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
