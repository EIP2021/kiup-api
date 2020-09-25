const express = require('express');
const exjwt = require('express-jwt');
const {Op} = require('sequelize');
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
    let stats = [];
    if (scope === 'day') {
      stats = await models.Consumption.findOne({
        where: {
          userId: id,
          date,
        },
      });
      if (stats) {
        stats = stats.stats;
      }
    } else if (scope === 'month') {
      const firstDayOfMonth = new Date(date);
      const lastDayOfMonth = new Date(firstDayOfMonth.getFullYear(),
        firstDayOfMonth.getMonth() + 1, 0);

      const allConsumptions = await models.Consumption.findAll({
        where: {
          userId: id,
        },
      });

      allConsumptions.forEach((element) => {
        if (new Date(element.date) >= firstDayOfMonth && new Date(element.date) <= lastDayOfMonth) {
          stats.push(element.stats);
        }
      });
    } else if (scope === 'week') {
      const today = new Date();
      const oneWeekBefore = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
      const allConsumptions = await models.Consumption.findAll({
        where: {
          userId: id,
        },
      });
      allConsumptions.forEach((element) => {
        if (new Date(element.date) >= oneWeekBefore && new Date(element.date) <= today) {
          stats.push(element.stats);
        }
      });
    } else if (scope === 'year') {
      const lastDayOfYear = new Date(new Date(new Date(date)).getFullYear(), 11, 32);
      const firstDayOfYear = new Date(new Date(new Date(date)).getFullYear(), 0, 1);

      const allConsumptions = await models.Consumption.findAll({
        where: {
          userId: id,
        },
      });

      allConsumptions.forEach((element) => {
        if (new Date(element.date) >= firstDayOfYear && new Date(element.date) <= lastDayOfYear) {
          stats.push(element.stats);
        }
      });
    } else {
      return error(400, 'Unsupported scope', res);
    }
    if (!stats) {
      const created = await models.Consumption.create({
        userId: id,
        date,
        stats: {
          potassium: 0, //  integers represent milligrams
          salt: 0,
          phosphorus: 0,
          proteins: 0,
        },
      });
      if (!created) {
        return error(500, 'Failed to create stat entry.', res);
      }
      return res.json({
        error: false,
        stats: created.stats,
      });
    }
    res.json({
      error: false,
      stats,
    });
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
    if (!currentStats) {
      const createdStats = await models.Consumption.create({
        userId: id,
        date,
        stats,
      });
      if (!createdStats) {
        return error(500, 'Failed to create stat entry.', res);
      }
      return res.json({
        error: false,
        stats: createdStats.stats,
      });
    }

    const updatedStats = await currentStats.update({
      stats: {
        potassium: stats.potassium + currentStats.stats.potassium,
        phosphorus: stats.phosphorus + currentStats.stats.phosphorus,
        proteins: stats.proteins + currentStats.stats.proteins,
        salt: stats.salt + currentStats.stats.salt,
      },
    });
    return res.json({
      error: false,
      stats: updatedStats.stats,
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.use(unauth);

module.exports = router;
