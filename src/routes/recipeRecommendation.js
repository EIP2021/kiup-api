const express = require('express');
const exjwt = require('express-jwt');
const sequelize = require('sequelize');
const models = require('../models');
const error = require('../error');
const config = require('../../config.json');
const recipes = require('../Recipes/recipes');

const jwtMiddleware = exjwt({
  secret: config.secret,
});

const router = express.Router();

router.get('/:uid', jwtMiddleware, async (req, res) => {
  const recipe = recipes[Math.floor(Math.random() * recipes.length)];
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
