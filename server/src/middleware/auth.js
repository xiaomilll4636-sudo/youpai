const jwt = require('jsonwebtoken');
const AppError = require('./AppError');
const db = require('../database');

const auth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(AppError.unauthorized('请先登录'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await db.query(
      'SELECT id, phone, nickname, avatar, status FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return next(AppError.unauthorized('用户不存在或已被禁用'));
    }
    
    const user = result.rows[0];
    
    if (user.status !== 'active') {
      return next(AppError.unauthorized('账户已被禁用'));
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(AppError.unauthorized('无效的认证令牌'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('认证令牌已过期'));
    }
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await db.query(
        'SELECT id, phone, nickname, avatar, status FROM users WHERE id = $1 AND deleted_at IS NULL',
        [decoded.id]
      );
      
      if (result.rows.length > 0 && result.rows[0].status === 'active') {
        req.user = result.rows[0];
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('没有权限执行此操作'));
    }
    next();
  };
};

module.exports = {
  auth,
  optionalAuth,
  restrictTo,
};
