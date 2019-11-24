const express = require('express');
const exjwt = require('express-jwt');
const models = require('../models');
const error = require('../error');
const config = require('../../config.json');

const jwtMiddleware = exjwt({
    secret: config.secret,
});

const router = express.Router();

isRecipeValid = (recipe) => {
  if (!recipe.uid || !recipe.name || !recipe.description || !Array.isArray(recipe.time) ||
    !Array.isArray(recipe.steps) || !Array.isArray(recipe.ingredients)) {
      return false;
    }
    return true;
}

router.post('/', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  if (!id) {
      return error(401, 'Invalid request', res);
  }
  if (!req.body) {
    return error(401, 'Invalid request');
  }
  if (!isRecipeValid(req.body)) {
      throw new Error('recipe should contain at least a name, a description, ingredients, times, and steps');
  }
  try {
    const recipe = await models.Recipe.create({
      uid: req.user.id,
      name: req.body.name,
      description: req.body.description,
      time: req.body.time,
      ingredients: req.body.ingredients,
      steps: req.body.steps,
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

router.get('/', async (req, res) => {
  try {
    const recipes = await models.Recipe.findAll();
    if (!recipes) {
      throw new Error('Couldn\'t get recipes');
    }
    res.status(200).json({
      error: false,
      body: recipes,
    });
    return 0;
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.get('/get/:id', async (req, res) => {
  try {
    const recipe = await models.Recipe.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!recipe) {
      throw new Error('Couldn\'t get recipe');
    }
    res.status(200).json({
      error: false,
      body: recipe,
    });
    return 0;
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.get('/delete/:id', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return error(401, 'Invalid request', res);
  }
  try {
    const recipe = await models.Recipe.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!recipe)
      throw new Error('Couldn\'t delete recipe');
    res.status(200).json({
      error: false,
      message: "Recipe succesfuly deleted",
    });
    return 0;
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.get('/my', jwtMiddleware, async(req, res) => {
  const { id } = req.user;
  if (!id) {
    return error(401, 'Invalid request', res);
  }
  try {
    const recipes = await models.Recipe.findAll({
      where: {
        uid: id,
      }
    });
    res.json({
      error: false,
      recipes: recipes,
    });
  } catch (err) {
    console.log(err);
    return error(500, 'Internal server error', res);
  }
});

router.post('/edit', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  if (!id) {
      return error(401, 'Invalid request', res);
  }
  if (!isRecipeValid(req.body)) {
      throw new Error('recipe should contain at least a name, a description, ingredients, times, and steps');
  }
  try {
    const recipe = await models.Recipe.findOne({
      where:
        { id: req.body.id }
    });
    if (!recipe) {
      throw new Error('Couldn\'t find recipe');
    }
    recipe.update({
      name: req.body.name,
      description: req.body.description,
      ingredients: req.body.ingredients,
      steps: req.body.steps,
    });
    return res.json({
      error: false,
      message: 'Recipe successfully updated',
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

module.exports = router;