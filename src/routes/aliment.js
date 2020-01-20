const express = require('express');
const exjwt = require('express-jwt');

const models = require('../models');
const error = require('../error');
const config = require('../../config.json');

const jwtMiddleware = exjwt({
  secret: config.secret,
});

const router = express.Router();

//TODO : Maybe add alim group name? not sure if useful
router.get('/:id', jwtMiddleware, async (req, res) => {
  const numberReg = /^\d+$/;
  if (req.params.id.match(numberReg) === null) {
    return error(400, 'Invalid alim code', res);
  }
  try {
    const result = await models.AlimentComposition.findOne({
      include: [{
        model: models.Aliment,
        required: true,
        attributes: {
          exclude: [
            'alim_code',
            'alim_nom_fr',
          ],
        },
      }],
      where: {
        alim_code: req.params.id,
      },
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

module.exports = router;
