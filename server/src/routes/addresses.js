const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../database');
const AppError = require('../middleware/AppError');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, name, phone, province, city, district, address, lat, lng, is_default, tag
       FROM addresses
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
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
    body('name').notEmpty().withMessage('请输入联系人姓名'),
    body('phone').isMobilePhone('zh-CN').withMessage('请输入正确的手机号'),
    body('address').notEmpty().withMessage('请输入详细地址'),
  ],
  auth,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(AppError.badRequest('验证失败', errors.array()));
      }

      const { name, phone, province, city, district, address, lat, lng, is_default, tag } = req.body;
      const userId = req.user.id;

      if (is_default) {
        await db.query(
          'UPDATE addresses SET is_default = false WHERE user_id = $1',
          [userId]
        );
      }

      const result = await db.query(
        `INSERT INTO addresses 
         (user_id, name, phone, province, city, district, address, lat, lng, is_default, tag)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [userId, name, phone, province, city, district, address, lat, lng, is_default || false, tag]
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

router.put('/:id',
  [
    body('name').optional().notEmpty().withMessage('联系人姓名不能为空'),
    body('phone').optional().isMobilePhone('zh-CN').withMessage('请输入正确的手机号'),
    body('address').optional().notEmpty().withMessage('详细地址不能为空'),
  ],
  auth,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(AppError.badRequest('验证失败', errors.array()));
      }

      const { id } = req.params;
      const { name, phone, province, city, district, address, lat, lng, is_default, tag } = req.body;
      const userId = req.user.id;

      const existingResult = await db.query(
        'SELECT id FROM addresses WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (existingResult.rows.length === 0) {
        return next(AppError.notFound('地址不存在'));
      }

      if (is_default) {
        await db.query(
          'UPDATE addresses SET is_default = false WHERE user_id = $1',
          [userId]
        );
      }

      const result = await db.query(
        `UPDATE addresses 
         SET name = COALESCE($1, name),
             phone = COALESCE($2, phone),
             province = COALESCE($3, province),
             city = COALESCE($4, city),
             district = COALESCE($5, district),
             address = COALESCE($6, address),
             lat = COALESCE($7, lat),
             lng = COALESCE($8, lng),
             is_default = COALESCE($9, is_default),
             tag = COALESCE($10, tag)
         WHERE id = $11 AND user_id = $12
         RETURNING *`,
        [name, phone, province, city, district, address, lat, lng, is_default, tag, id, userId]
      );

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return next(AppError.notFound('地址不存在'));
    }

    res.json({
      success: true,
      message: '地址已删除'
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/default', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query(
      'UPDATE addresses SET is_default = false WHERE user_id = $1',
      [userId]
    );

    const result = await db.query(
      'UPDATE addresses SET is_default = true WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return next(AppError.notFound('地址不存在'));
    }

    res.json({
      success: true,
      message: '已设为默认地址'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
