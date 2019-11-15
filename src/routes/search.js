const express = require('express');
const exjwt = require('express-jwt');
const Sequelize = require('sequelize');

const models = require('../models');
const error = require('../error');
const config = require('../../config.json');
const unauth = require('../unauthentified');

const jwtMiddleware = exjwt({
  secret: config.secret,
});

const router = express.Router();

//  Example request : /search?query=poulet&page=1&pageSize=10`
router.get('/search', jwtMiddleware, async (req, res) => {
  const {
    query, page, pageSize, categoryId,
  } = req.query;

  if ((!query && !categoryId) || !page || !pageSize) {
    return error(400, 'Invalid request', res);
  }
  const numberReg = /^\d+$/;
  if (page.match(numberReg) === null || pageSize.match(numberReg) === null) {
    return error(400, 'Invalid page or page size parameter', res);
  }
  try {
    const result = await models.AlimentComposition.findAll({
      include: [{
        model: models.Aliment,
        required: true,
        attributes: {
          exclude: [
            'alim_code',
            'alim_nom_fr',
            'alim_ssgrp_code',
          ],
        },
        where: categoryId ? {
          alim_ssgrp_code: categoryId,
        } : {},
      }],
      limit: pageSize * 1,
      offset: pageSize * (page - 1),
      attributes: {
        exclude: [
          'composition',
        ],
      },
      where: query ? {
        name: {
          [Sequelize.Op.like]: `%${query}%`,
        },
      } : {},
      raw: true,
    });
    res.json({
      error: false,
      result,
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
  return 0;
});

router.use(unauth);

module.exports = router;
