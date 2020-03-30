const express = require('express');
const exjwt = require('express-jwt');

const models = require('../models');
const error = require('../error');
const config = require('../../config.json');

const jwtMiddleware = exjwt({
  secret: config.secret,
});

const router = express.Router();

const parsAlim = (result) => {
  const neededNutrient = {};
  Object.keys(result.composition).forEach((key) => {
    const nutrient = result.composition[key].name;
    if (nutrient === 'protéines (g/100g)' || nutrient === 'potassium (mg/100g)'
        || nutrient === 'phosphore (mg/100g)' || nutrient === 'sel chlorure de sodium (g/100g)') {
      neededNutrient[result.composition[key].name] = result.composition[key].teneur;
    }
  });
  return neededNutrient;
};

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
    const neededNutrient = parsAlim(result);
    res.json({
      error: false,
      neededNutrient,
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
  return 0;
});

module.exports = router;
