const express = require('express');
const exjwt = require('express-jwt');

const models = require('../models');
const error = require('../error');
const config = require('../../config.json');
const unauth = require('../unauthentified');

const jwtMiddleware = exjwt({
  secret: config.secret,
});

const router = express.Router();

router.post('/consume', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  const { alimCode, barcode, recipeId } = req.body;
  if (!id || (!alimCode && !barcode && !recipeId)) {
    return error(400, 'Invalid request', res);
  }
  try {
    const newEntry = await models.History.create({
      userId: id,
      alimCode: alimCode || null,
      barcode: barcode || null,
      recipeId: recipeId || null,
    });
    if (!newEntry) {
      return error(500, 'Failed to create history entry.', res);
    }
    return res.json({
      error: false,
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

//TODO : get history route

router.use(unauth);

module.exports = router;
