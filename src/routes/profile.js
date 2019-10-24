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

router.get('/profile', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return error(401, 'Invalid request', res);
  }
  try {
    const info = await models.UserInfo.findOne({
      where: {
        id,
      },
    });
    res.json({
      error: false,
      info,
    });
    return 0;
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.post('/profile', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  const { info } = req.body;
  if (!id || !info) {
    return error(401, 'Invalid request', res);
  }
  try {
    const userInfo = await models.UserInfo.findOne({
      where: {
        id,
      },
    });
    const updated = await userInfo.update({
      ...info,
    });
    res.json({
      error: false,
      info: updated,
    });
    return 0;
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.use(unauth);

module.exports = router;
