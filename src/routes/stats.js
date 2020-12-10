/* eslint-disable no-loop-func */
const express = require('express');
const exjwt = require('express-jwt');
const moment = require('moment');
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
    } else if (scope === 'week') {
      const firstDayOfWeek = moment().startOf('isoWeek').toDate();
      const lastDayOfWeek = moment().endOf('isoWeek').toDate();

      const allConsumptions = await models.Consumption.findAll({
        where: {
          userId: id,
        },
      });

      stats = {
        potassium: [],
        proteins: [],
        phosphorus: [],
        salt: [],
      };
      for (
        let i = moment(firstDayOfWeek);
        i.isBefore(lastDayOfWeek);
        i.add(1, 'day')
      ) {
        let f = false;
        allConsumptions.forEach((c) => {
          if (i.format('YYYY-MM-DD') === c.date) {
            f = true;
            stats.potassium.push(c.stats.potassium);
            stats.proteins.push(c.stats.proteins);
            stats.salt.push(c.stats.salt);
            stats.phosphorus.push(c.stats.phosphorus);
          }
        });
        if (!f) {
          stats.potassium.push(0);
          stats.proteins.push(0);
          stats.salt.push(0);
          stats.phosphorus.push(0);
        }
      }
    } else if (scope === 'month') {
      const firstDayOfMonth = moment().startOf('month').toDate();
      const lastDayOfMonth = moment().endOf('month').toDate();

      const allConsumptions = await models.Consumption.findAll({
        where: {
          userId: id,
        },
      });

      stats = allConsumptions.filter((el) => {
        const d = new Date(el.date);
        return d >= firstDayOfMonth && d <= lastDayOfMonth;
      });

      stats = {
        potassium: [],
        proteins: [],
        phosphorus: [],
        salt: [],
      };
      for (
        let i = moment(firstDayOfMonth);
        i.isBefore(lastDayOfMonth);
        i.add(1, 'day')
      ) {
        let f = false;
        allConsumptions.forEach((c) => {
          if (i.format('YYYY-MM-DD') === c.date) {
            f = true;
            stats.potassium.push(c.stats.potassium);
            stats.proteins.push(c.stats.proteins);
            stats.salt.push(c.stats.salt);
            stats.phosphorus.push(c.stats.phosphorus);
          }
        });
        if (!f) {
          stats.potassium.push(0);
          stats.proteins.push(0);
          stats.salt.push(0);
          stats.phosphorus.push(0);
        }
      }
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
