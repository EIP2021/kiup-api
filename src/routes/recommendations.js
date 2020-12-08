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

const MEAT_ALIM_CODE = 124;
const VEGETABLE_CODE = 987;

router.get('/recommendations', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return error(400, 'Invalid request', res);
  }
  try {
    const history = await models.History.findAll({
      where: {
        userId: id,
      },
    });
    console.log(history);
    const tips = [];
    const groupedCodes = {};
    history.forEach(async () => {
      groupedCodes.alimCode = groupedCodes.alimCode
        ? groupedCodes.alimCode + 1
        : 1;
    });
    if (groupedCodes.alimCode === MEAT_ALIM_CODE) {
      const percentage = groupedCodes[MEAT_ALIM_CODE] / history.length;
      if (percentage >= 0.5) {
        tips.push(
          'Surconsommation de viandes détectée. Variez votre apport en protéines.'
        );
      }
    }
    if (groupedCodes.alimCode === VEGETABLE_CODE) {
      const percentage = groupedCodes[VEGETABLE_CODE] / history.length;
      if (percentage <= 0.4) {
        tips.push('Mangez plus de légumes');
      }
    }
    return res.json({
      error: false,
      tips,
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.use(unauth);

module.exports = router;
