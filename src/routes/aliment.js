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
  const neededNutrient = {
    proteins: null,
    potassium: null,
    phosphorus: null,
    salt: null,
  };
  const regExp = /\(([^)]+)\)/;
  Object.keys(result.composition).forEach((key) => {
    const nutrient = result.composition[key].name;
    if (nutrient === 'protéines (g/100g)') {
      neededNutrient.proteins = {
        quantity:
          parseFloat(result.composition[key].teneur.replace(/,/g, '.')) || 0,
        unit: nutrient.match(regExp).pop(),
      };
    }
    if (nutrient === 'potassium (mg/100g)') {
      neededNutrient.potassium = {
        quantity:
          parseFloat(result.composition[key].teneur.replace(/,/g, '.')) || 0,
        unit: nutrient.match(regExp).pop(),
      };
    }
    if (nutrient === 'phosphore (mg/100g)') {
      neededNutrient.phosphorus = {
        quantity:
          parseFloat(result.composition[key].teneur.replace(/,/g, '.')) || 0,
        unit: nutrient.match(regExp).pop(),
      };
    }
    if (nutrient === 'sel chlorure de sodium (g/100g)') {
      neededNutrient.salt = {
        quantity:
          parseFloat(result.composition[key].teneur.replace(/,/g, '.')) || 0,
        unit: nutrient.match(regExp).pop(),
      };
    }
  });
  return neededNutrient;
};

router.get('/:id', jwtMiddleware, async (req, res) => {
  const numberReg = /^\d+$/;
  if (req.params.id.match(numberReg) === null) {
    return error(400, 'Invalid alim code', res);
  }
  try {
    const result = await models.AlimentComposition.findOne({
      include: [
        {
          model: models.Aliment,
          required: true,
          attributes: {
            exclude: ['alim_code', 'alim_nom_fr'],
          },
        },
      ],
      where: {
        alim_code: req.params.id,
      },
      raw: true,
    });
    const neededNutrient = parsAlim(result);
    res.json({
      error: false,
      nutriments: neededNutrient,
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
  return 0;
});

module.exports = router;
