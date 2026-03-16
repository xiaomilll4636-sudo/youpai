const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../database');
const AppError = require('../middleware/AppError');
const { auth } = require('../middleware/auth');
const dayjs = require('dayjs');
const { notifyUser, notifyAdmins, NotificationTypes } = require('../services/websocket');

const generateOrderNo = () => {
  const dateStr = dayjs().format('YYYYMMDD');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `YP${dateStr}${random}`;
};

router.get('/', auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let whereClause = "WHERE o.user_id = $1";
    const params = [userId];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND o.status = $${paramIndex++}`;
      params.push(status);
    }

    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM orders o ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT 
        o.id, o.order_no, o.service_address, o.service_date, o.service_time,
        o.duration, o.total_amount, o.final_amount, o.status, o.created_at,
        st.name as service_name, st.icon as service_icon,
        h.real_name as housekeeper_name, h.avatar as housekeeper_avatar
       FROM orders o
       JOIN service_types st ON st.id = o.service_type_id
       LEFT JOIN housekeepers h ON h.id = o.housekeeper_id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        items: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `SELECT 
        o.*,
        st.name as service_name, st.icon as service_icon,
        h.real_name as housekeeper_name, h.avatar as housekeeper_avatar
       FROM orders o
       JOIN service_types st ON st.id = o.service_type_id
       LEFT JOIN housekeepers h ON h.id = o.housekeeper_id
       WHERE o.id = $1 AND o.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return next(AppError.notFound('订单不存在'));
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

router.post('/',
  [
    body('service_type_id').isUUID().withMessage('请选择服务类型'),
    body('service_address').notEmpty().withMessage('请输入服务地址'),
    body('service_date').isDate().withMessage('请选择服务日期'),
    body('service_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('请选择服务时间'),
    body('duration').isInt({ min: 1, max: 12 }).withMessage('服务时长为1-12小时'),
    body('contact_name').notEmpty().withMessage('请输入联系人'),
    body('contact_phone').isMobilePhone('zh-CN').withMessage('请输入正确的手机号'),
  ],
  auth,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(AppError.badRequest('验证失败', errors.array()));
      }

      const {
        service_type_id,
        housekeeper_id,
        service_address,
        service_lat,
        service_lng,
        service_date,
        service_time,
        duration,
        contact_name,
        contact_phone,
        remark
      } = req.body;

      const userId = req.user.id;

      const serviceTypeResult = await db.query(
        'SELECT id, name, base_price FROM service_types WHERE id = $1 AND is_active = true',
        [service_type_id]
      );

      if (serviceTypeResult.rows.length === 0) {
        return next(AppError.badRequest('服务类型不存在'));
      }

      const serviceType = serviceTypeResult.rows[0];
      const unitPrice = serviceType.base_price;
      const totalAmount = unitPrice * duration;

      const orderNo = generateOrderNo();

      const result = await db.query(
        `INSERT INTO orders 
         (order_no, user_id, housekeeper_id, service_type_id, service_address,
          service_lat, service_lng, service_date, service_time, duration,
          unit_price, total_amount, final_amount, remark)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [
          orderNo, userId, housekeeper_id || null, service_type_id, service_address,
          service_lat || null, service_lng || null, service_date, service_time, duration,
          unitPrice, totalAmount, totalAmount, remark || null
        ]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
      
      notifyAdmins(NotificationTypes.ORDER_CREATED, { orderId: result.rows[0].id, orderNo });
      notifyUser(userId, NotificationTypes.ORDER_CREATED, { orderId: result.rows[0].id, orderNo });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/:id/cancel', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const orderResult = await db.query(
      'SELECT id, status FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (orderResult.rows.length === 0) {
      return next(AppError.notFound('订单不存在'));
    }

    const order = orderResult.rows[0];

    if (!['pending_payment', 'paid', 'confirmed'].includes(order.status)) {
      return next(AppError.badRequest('当前状态无法取消订单'));
    }

    await db.query(
      `UPDATE orders 
       SET status = 'cancelled', cancel_reason = $1, cancelled_at = NOW()
       WHERE id = $2`,
      [reason || null, id]
    );

    res.json({
      success: true,
      message: '订单已取消'
    });
    
    notifyAdmins(NotificationTypes.ORDER_CANCELLED, { orderId: id, reason });
    notifyUser(userId, NotificationTypes.ORDER_CANCELLED, { orderId: id, reason });
  } catch (error) {
    next(error);
  }
});

// 订单状态流转 (简化的状态机处理)
router.post('/:id/status', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['paid', 'confirmed', 'in_progress', 'completed', 'evaluated'];
    if (!validStatuses.includes(status)) {
      return next(AppError.badRequest('无效的状态更新'));
    }

    const orderResult = await db.query(
      'SELECT id, status FROM orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      return next(AppError.notFound('订单不存在'));
    }

    const order = orderResult.rows[0];

    // 状态流转验证逻辑可在此处扩展 (例如只能 pending_payment -> paid, paid -> confirmed)
    if (order.status === 'cancelled') {
        return next(AppError.badRequest('已取消的订单无法更新状态'));
    }

    await db.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, id]
    );
    
    // 记录日志
    await db.query(
      `INSERT INTO order_logs (order_id, action, previous_status, new_status, remark)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, 'update_status', order.status, status, '用户或服务人员更新状态']
    );

    res.json({
      success: true,
      message: '状态已更新',
      data: { status }
    });
    
    // 发送 WebSocket 通知
    let eventType = NotificationTypes.SYSTEM_NOTICE;
    if (status === 'paid') eventType = NotificationTypes.ORDER_PAID;
    if (status === 'completed') eventType = NotificationTypes.ORDER_COMPLETED;
    
    notifyUser(order.user_id, eventType, { orderId: id, status });
    notifyAdmins(eventType, { orderId: id, status });
  } catch (error) {
    next(error);
  }
});

// 分配服务人员
router.post('/:id/assign', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { housekeeper_id } = req.body;
    
    // 检查服务人员是否存在并且可用
    const housekeeperResult = await db.query(
      "SELECT id FROM housekeepers WHERE id = $1 AND deleted_at IS NULL",
      [housekeeper_id]
    );

    if (housekeeperResult.rows.length === 0) {
      return next(AppError.notFound('服务人员不存在'));
    }

    const orderResult = await db.query(
      'SELECT id, status, user_id FROM orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      return next(AppError.notFound('订单不存在'));
    }

    const order = orderResult.rows[0];

    await db.query(
      `UPDATE orders SET housekeeper_id = $1, status = 'confirmed', updated_at = NOW() WHERE id = $2`,
      [housekeeper_id, id]
    );
    
    // 记录日志
    await db.query(
      `INSERT INTO order_logs (order_id, action, previous_status, new_status, remark)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, 'assign', order.status, 'confirmed', '系统分配服务人员']
    );

    res.json({
      success: true,
      message: '服务人员已分配'
    });
    
    notifyUser(order.user_id, NotificationTypes.ORDER_ASSIGNED, { orderId: id, housekeeperId: housekeeper_id });
    notifyAdmins(NotificationTypes.ORDER_ASSIGNED, { orderId: id, housekeeperId: housekeeper_id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
