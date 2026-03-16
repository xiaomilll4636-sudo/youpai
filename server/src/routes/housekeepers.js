const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const db = require('../database');
const AppError = require('../middleware/AppError');
const { optionalAuth } = require('../middleware/auth');

router.get('/',
  optionalAuth,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('skill').optional().isString(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('rating').optional().isFloat({ min: 0, max: 5 }),
    query('sort').optional().isIn(['rating', 'price', 'orders', 'experience']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(AppError.badRequest('参数错误', errors.array()));
      }

      const {
        page = 1,
        limit = 10,
        skill,
        minPrice,
        maxPrice,
        rating,
        sort = 'rating',
        search,
      } = req.query;

      const offset = (page - 1) * limit;
      const conditions = ['h.status = $1', 'h.deleted_at IS NULL'];
      const values = ['verified'];
      let paramCount = 2;

      if (skill) {
        conditions.push(`$${paramCount++} = ANY(h.skills)`);
        values.push(skill);
      }

      if (minPrice !== undefined) {
        conditions.push(`h.price_min >= $${paramCount++}`);
        values.push(parseFloat(minPrice));
      }

      if (maxPrice !== undefined) {
        conditions.push(`h.price_max <= $${paramCount++}`);
        values.push(parseFloat(maxPrice));
      }

      if (rating !== undefined) {
        conditions.push(`h.rating >= $${paramCount++}`);
        values.push(parseFloat(rating));
      }

      if (search) {
        conditions.push(`h.real_name ILIKE $${paramCount++}`);
        values.push(`%${search}%`);
      }

      const sortMap = {
        rating: 'h.rating DESC',
        price: 'h.price_min ASC',
        orders: 'h.order_count DESC',
        experience: 'h.experience_years DESC',
      };

      const countResult = await db.query(
        `SELECT COUNT(*) FROM housekeepers h WHERE ${conditions.join(' AND ')}`,
        values
      );

      const dataValues = [...values, limit, offset];
      const result = await db.query(
        `SELECT 
          h.id, h.real_name, h.avatar, h.skills, h.experience_years,
          h.price_min, h.price_max, h.rating, h.order_count, h.description
         FROM housekeepers h
         WHERE ${conditions.join(' AND ')}
         ORDER BY ${sortMap[sort]}
         LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
        dataValues
      );

      res.json({
        success: true,
        data: {
          items: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(countResult.rows[0].count),
            totalPages: Math.ceil(countResult.rows[0].count / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT 
        h.id, h.real_name, h.avatar, h.gender, h.skills, h.experience_years,
        h.price_min, h.price_max, h.rating, h.order_count, h.review_count,
        h.description, h.service_areas, h.verified_at
       FROM housekeepers h
       WHERE h.id = $1 AND h.status = 'verified' AND h.deleted_at IS NULL`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return next(AppError.notFound('阿姨不存在'));
    }

    const housekeeper = result.rows[0];

    const reviewsResult = await db.query(
      `SELECT r.id, r.rating, r.content, r.images, r.tags, r.created_at,
        u.nickname as user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.housekeeper_id = $1
       ORDER BY r.created_at DESC
       LIMIT 5`,
      [req.params.id]
    );

    housekeeper.reviews = reviewsResult.rows;

    res.json({
      success: true,
      data: housekeeper,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/schedule', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(AppError.badRequest('请提供日期范围'));
    }

    const result = await db.query(
      `SELECT date, start_time, end_time, status
       FROM schedules
       WHERE housekeeper_id = $1 
         AND date >= $2 
         AND date <= $3
       ORDER BY date, start_time`,
      [id, startDate, endDate]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
