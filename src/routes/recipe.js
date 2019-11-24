const express = require('express');

const models = require('../models');
const error = require('../error');
const config = require('../../config.json');

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
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
  return 0;
});

router.get('/get/:id', async (req, res) => {
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
  return 0;
});

router.post('/fav/:id', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  if (!id) {
      return error(401, 'Invalid request', res);
  }
  try {
    const recipeFavorite = await models.RecipeFavorite.findOrCreate({
      where:
        { uid: id, rid: req.params.id}
    });
    if (!recipeFavorite) {
      throw new Error('Couldn\'t findorcreate recipeFavorite');
    }
    if (recipeFavorite[1] === false) {
      await models.RecipeFavorite.destroy({
        where:
        { uid: 1, rid: req.params.id}
      });
      return res.json({
        error: false,
        message: 'Recipe successfully deleted from favorites'
      });
    } else {
      return res.json({
        error: false,
        message: 'Recipe successfully added to favorites'
      });
    }
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

module.exports = router;