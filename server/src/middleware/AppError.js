class AppError extends Error {
  constructor(message, statusCode, code = 'APPLICATION_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message = '未授权访问') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = '禁止访问') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(message = '资源不存在') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static conflict(message, details = null) {
    return new AppError(message, 409, 'CONFLICT', details);
  }

  static internal(message = '服务器内部错误') {
    return new AppError(message, 500, 'INTERNAL_ERROR');
  }
}

module.exports = AppError;
