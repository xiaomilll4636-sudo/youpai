const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../database');
const AppError = require('../middleware/AppError');
const { auth } = require('../middleware/auth');

router.get('/profile', auth, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, phone, nickname, avatar, gender, created_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

router.put('/profile',
  auth,
  [
    body('nickname').optional().isLength({ max: 50 }).withMessage('昵称最多50字符'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('性别无效'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(AppError.badRequest('验证失败', errors.array()));
      }

      const { nickname, gender, avatar } = req.body;
      const updates = [];
      const values = [req.user.id];
      let paramCount = 2;

      if (nickname !== undefined) {
        updates.push(`nickname = $${paramCount++}`);
        values.push(nickname);
      }
      if (gender !== undefined) {
        updates.push(`gender = $${paramCount++}`);
        values.push(gender);
      }
      if (avatar !== undefined) {
        updates.push(`avatar = $${paramCount++}`);
        values.push(avatar);
      }

      if (updates.length === 0) {
        return next(AppError.badRequest('没有要更新的内容'));
      }

      const result = await db.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $1 
         RETURNING id, phone, nickname, avatar, gender`,
        values
      );

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
