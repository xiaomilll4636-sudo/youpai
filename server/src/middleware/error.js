const AppError = require('./AppError');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code || 'INTERNAL_ERROR',
      stack: err.stack,
      details: err.details || null,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code || 'APPLICATION_ERROR',
      details: err.details || null,
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: '数据已存在',
      code: 'DUPLICATE_ENTRY',
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: '关联数据不存在',
      code: 'FOREIGN_KEY_VIOLATION',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: '无效的认证令牌',
      code: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: '认证令牌已过期',
      code: 'TOKEN_EXPIRED',
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: 'VALIDATION_ERROR',
      details: err.details,
    });
  }

  console.error('ERROR 💥:', err);
  return res.status(500).json({
    success: false,
    error: '服务器内部错误',
    code: 'INTERNAL_ERROR',
  });
};

const notFoundHandler = (req, res, next) => {
  const err = new AppError(`找不到路径 ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(err);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
