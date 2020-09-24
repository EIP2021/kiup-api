const express = require('express');
const exjwt = require('express-jwt');
const sequelize = require('sequelize');
const models = require('../models');
const error = require('../error');
const config = require('../../config.json');
const recipes = require('../Recipes/recipes');
const fileSystem = require('../utils/fileSystem');

const jwtMiddleware = exjwt({
  secret: config.secret,
});

const router = express.Router();

router.get('/', jwtMiddleware, async (req, res) => {
  const stats = [];
  const { id } = req.user;
  // const { weight } = await models.UserInfo.findOne({
  //   where: {
  //     id,
  //   },
  // });
  let recipe = {};
  const maxProteins = 0.6 * 75;
  let proteins = 0;
  let salt = 0;
  let potassium = 0;
  let phosphorus = 0;
  const allConsumptions = await models.Consumption.findAll({
    where: {
      userId: id,
    },
  });

  allConsumptions.forEach((element) => {
    if (element.date === new Date().toISOString().slice(0, 10)) {
      stats.push(element.stats);
    }
  });
  if (stats.length) {
    stats.forEach((element) => {
      proteins += element.proteins;
      salt += element.salt;
      potassium += element.potassium;
      phosphorus += element.phosphorus;
    });

    if (proteins <= maxProteins) {
      recipe = await models.Recipe.findOne({
        where: {
          tag: 'strong proteins',
        },
      });
    } else if (salt >= 0.6) {
      recipe = await models.Recipe.findOne({
        where: {
          tag: 'weak salt',
        },
      });
    } else {
      Math.floor(Math.random() * 2) === 0 ? recipe = await models.Recipe.findOne({
        where: {
          tag: 'weak potassium',
        },
      }) : recipe = await models.Recipe.findOne({
        where: {
          tag: 'weak phosphorus',
        },
      });
    }
  } else {
    const oldRecommendation = fileSystem.readFile('src/Recipes/oldRecommendations.json', true);
    let recipeId = Math.floor(Math.random() * recipes.length);

    while (oldRecommendation[id] === recipeId) {
      recipeId = Math.floor(Math.random() * recipes.length);
    }

    recipe = recipes[recipeId];

    fileSystem.writeFile('src/Recipes/oldRecommendations.json',
      {
        ...oldRecommendation,
        [id]: recipeId,
      });
  }
  try {
    res.json({
      error: false,
      recipe,
    });
  } catch (err) {
    console.log('error');
  }
});

module.exports = router;
