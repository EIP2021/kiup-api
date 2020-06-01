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

router.get('/:uid', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  const oldRecommendation = fileSystem.readFile('src/Recipes/oldRecommendations.json', true);
  let recipeId = Math.floor(Math.random() * recipes.length);

  while (oldRecommendation[id] === recipeId) {
    recipeId = Math.floor(Math.random() * recipes.length);
  }

  const recipe = recipes[recipeId];

  fileSystem.writeFile('src/Recipes/oldRecommendations.json',
    {
      ...oldRecommendation,
      [id]: recipeId,
    });

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
