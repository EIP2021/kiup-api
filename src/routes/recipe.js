const express = require('express');

const models = require('../models');
const error = require('../error');
const config = require('../../config.json');

const router = express.Router();

router.post('/recipe', async (req, res) => {
  console.log(req.body);
  const recipeObj = req.body.recipe;
  if (!req.body || !recipeObj.name || !recipeObj.description || !recipeObj.steps
    || !Array.isArray(recipeObj.steps)) {
    return error(400, 'recipe should containe at least a name, a description, and steps', res);
  }
  try {
    const recipe = await models.Recipe.create({
      name: recipeObj.name,
      description: recipeObj.description,
      steps: JSON.stringify(recipeObj.steps),
    });
    if (!recipe) {
      throw new Error('Couldn\'t create recipe');
    }
    return res.json({
      error: false,
      message: 'Recipe successfully saved',
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.get('/recipe', async (req, res) => {
  try {
    const recipes = await models.Recipe.findAll();
    if (!recipes) {
      throw new Error('Couldn\'t get recipes');
    }
    res.status(200).json({
      error: false,
      body: recipes,
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
  return 0;
});

router.get('/recipe/:recipe', async (req, res) => {
  console.log(req.params.recipe);
  try {
    const recipes = await models.Recipe.findAll({
      where: {
        name: req.params.recipe,
      },
    });
    if (!recipes || recipes.length === 0) {
      throw new Error('Couldn\'t get recipes');
    }
    res.status(200).json({
      error: false,
      body: recipes,
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
  return 0;
});

module.exports = router;
