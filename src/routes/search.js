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

const splitArray = (array, page, pageSize) => {
  const result = [];
  const startingIndex = page * pageSize;
  for (let i = 0; i < pageSize; i += 1) {
    if (startingIndex + i >= array.length) {
      return result;
    }
    result[i] = array[startingIndex + i];
  }
  return result;
};

const router = express.Router();

//  Example request : /search?query=poulet&page=1&pageSize=10
router.get('/search', jwtMiddleware, async (req, res) => {
  const { query, page, pageSize } = req.query;

  if (!query || !page || !pageSize) {
    return error(400, 'Invalid request', res);
  }
  try {
    const aliments = await models.Aliment.findAll({
      attributes: {
        exclude: [
          'composition',
        ],
      },
      where: {
        name: {
          [Sequelize.Op.like]: `%${query}%`,
        },
      },
      raw: true,
    });
    const currentPage = page - 1;
    const result = splitArray(aliments, currentPage, pageSize);
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
