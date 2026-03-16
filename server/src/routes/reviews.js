const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../database');
const AppError = require('../middleware/AppError');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT r.id, r.rating, r.content, r.images, r.tags, r.is_anonymous, r.created_at,
        h.real_name as housekeeper_name,
        st.name as service_name
       FROM reviews r
       JOIN housekeepers h ON h.id = r.housekeeper_id
       JOIN orders o ON o.id = r.order_id
       JOIN service_types st ON st.id = o.service_type_id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

router.post('/',
  [
    body('order_id').isUUID().withMessage('订单ID无效'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('评分必须在1-5之间'),
    body('content').optional().isLength({ max: 500 }).withMessage('评价内容最多500字'),
  ],
  auth,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(AppError.badRequest('验证失败', errors.array()));
      }

      const { order_id, rating, content, images, tags, is_anonymous } = req.body;
      const userId = req.user.id;

      const orderResult = await db.query(
        `SELECT o.id, o.user_id, o.housekeeper_id, o.status
         FROM orders o
         WHERE o.id = $1`,
        [order_id]
      );

      if (orderResult.rows.length === 0) {
        return next(AppError.notFound('订单不存在'));
      }

      const order = orderResult.rows[0];

      if (order.user_id !== userId) {
        return next(AppError.forbidden('无权评价此订单'));
      }

      if (order.status !== 'completed') {
        return next(AppError.badRequest('只能评价已完成的订单'));
      }

      const existingReview = await db.query(
        'SELECT id FROM reviews WHERE order_id = $1',
        [order_id]
      );

      if (existingReview.rows.length > 0) {
        return next(AppError.conflict('该订单已评价'));
      }

      const result = await db.query(
        `INSERT INTO reviews 
         (order_id, user_id, housekeeper_id, rating, content, images, tags, is_anonymous)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [order_id, userId, order.housekeeper_id, rating, content, images || [], tags || [], is_anonymous || false]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
