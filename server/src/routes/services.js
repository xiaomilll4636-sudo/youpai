const express = require('express');
const router = express.Router();
const db = require('../database');
const AppError = require('../middleware/AppError');

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, name, icon, description, base_price, unit, sort_order 
       FROM service_types 
       WHERE is_active = true 
       ORDER BY sort_order`
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, name, icon, description, base_price, unit 
       FROM service_types 
       WHERE id = $1 AND is_active = true`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return next(AppError.notFound('服务类型不存在'));
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
