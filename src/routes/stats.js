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

//  Example request : /stats?scope=day&date=2019-10-25
router.get('/stats', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  const { scope, date } = req.query;
  if (!id || !scope || !date) {
    return error(401, 'Invalid request', res);
  }
  try {
    if (scope === 'day') {
      const stats = await models.Consumption.findOne({
        where: {
          userId: id,
          date,
        },
      });
      if (!stats) {
        const created = await models.Consumption.create({
          userId: id,
          date,
          stats: {
            potassium: 0, //  integers represent milligrams
            sodium: 0,
            phosphorus: 0,
            protein: 0,
          },
        });
        if (!created) {
          return error(500, 'Failed to create stat entry.');
        }
        return res.json({
          error: false,
          stats: created.stats,
        });
      }
      res.json({
        error: false,
        stats: stats.stats,
      });
    } else { // TODO : add week and month scope.
      return error(400, 'Unsupported scope', res);
    }
    return 0;
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.post('/stats', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  const { stats, date } = req.body;
  if (!id || !stats || !date) {
    return error(400, 'Invalid request', res);
  }
  try {
    const currentStats = await models.Consumption.findOne({
      where: {
        userId: id,
        date,
      },
    });
    await currentStats.update({
      stats,
    });
    return res.json({
      error: false,
      stats,
    });
  } catch (err) {
    console.error(err);
    return (500, 'Internal server error', res);
  }
});

router.use(unauth);

module.exports = router;
