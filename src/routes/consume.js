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
      id: newEntry.id,
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.delete('/history/:entryId', jwtMiddleware, async (req, res) => {
  const numberReg = /^\d+$/;
  if (req.params.entryId.match(numberReg) === null) {
    return error(400, 'Invalid history entry id', res);
  }
  const { id } = req.user;
  if (!id) {
    return error(400, 'Invalid request', res);
  }
  try {
    const entry = await models.History.findOne({
      id: req.params.entryId,
      userId: id,
    });
    if (!entry) {
      return error(400, 'Could not find entry.', res);
    }
    const result = await entry.destroy();
    if (!result) {
      return error(500, 'Failed to delete entry', res);
    }
    return res.json({
      error: false,
    });
  } catch (err) {
    console.error(err);
    return error(500, "Internal server error", res);
  }
});

router.get('/history', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return error(400, 'Invalid request', res);
  }
  try {
    const history = await models.History.findAll({
      where: {
        userId: id,
      }
    });
    console.log(history);
    return res.json({
      error: false,
      history,
    });  
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.use(unauth);

module.exports = router;
