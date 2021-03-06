const express = require('express');
const exjwt = require('express-jwt');
const sequelize = require('sequelize');
const models = require('../models');
const error = require('../error');
const config = require('../../config.json');

const jwtMiddleware = exjwt({
  secret: config.secret,
});

const router = express.Router();

const isRecipeValid = (recipe) => {
  return !(
    !recipe.name ||
    !recipe.description ||
    !recipe.prepTime ||
    !Array.isArray(recipe.steps) ||
    !Array.isArray(recipe.ingredients)
  );
};

router.post('/', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return error(401, 'Invalid request', res);
  }
  if (!req.body) {
    return error(401, 'Invalid request');
  }
  try {
    if (!isRecipeValid(req.body)) {
      throw new Error(
        'recipe should contain at least a name, a description, ingredients, times, and steps'
      );
    }
    const recipe = await models.Recipe.create({
      uid: id,
      name: req.body.name,
      description: req.body.description,
      prepTime: req.body.prepTime,
      cookTime: req.body.cookTime,
      ingredients: req.body.ingredients,
      steps: req.body.steps,
      tag: req.body.tag,
      rating: req.body.rating,
      comments: req.body.comments,
      people: req.body.people,
      image: req.body.image,
    });
    if (!recipe) {
      throw new Error("Couldn't create recipe");
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
      throw new Error("Couldn't get recipes");
    }
    return res.json({
      error: false,
      body: recipes,
    });
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
      throw new Error("Couldn't get recipe");
    }
    return res.json({
      error: false,
      body: recipe,
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.post('/delete/:id', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return error(401, 'Invalid request', res);
  }
  try {
    await models.Recipe.destroy({
      where: {
        id: req.params.id,
        uid: id,
      },
    });
    return res.json({
      error: false,
      message: 'Recipe successfully deleted',
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.get('/my', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return error(401, 'Invalid request', res);
  }
  try {
    const recipes = await models.Recipe.findAll({
      where: {
        uid: id,
      },
    });
    return res.json({
      error: false,
      recipes,
    });
  } catch (err) {
    console.log(err);
    return error(500, 'Internal server error', res);
  }
});

router.post('/edit/:id', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return error(401, 'Invalid request', res);
  }
  try {
    if (!isRecipeValid(req.body)) {
      throw new Error(
        'recipe should contain at least a name, a description, ingredients, times, and steps'
      );
    }
    const recipe = await models.Recipe.findOne({
      where: { id: req.params.id },
    });
    if (!recipe) {
      throw new Error("Couldn't find recipe");
    }
    recipe.update({
      name: req.body.name,
      description: req.body.description,
      prepTime: req.body.prepTime,
      cookTime: req.body.cookTime,
      ingredients: req.body.ingredients,
      steps: req.body.steps,
      comments: req.body.comments,
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

router.post('/fav/:id', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return error(401, 'Invalid request', res);
  }
  try {
    const recipeFavorite = await models.RecipeFavorite.findOrCreate({
      where: { uid: id, rid: req.params.id },
    });
    if (!recipeFavorite) {
      throw new Error("Couldn't findorcreate recipeFavorite");
    }
    if (recipeFavorite[1] === false) {
      await models.RecipeFavorite.destroy({
        where: { uid: id, rid: req.params.id },
      });
      return res.json({
        error: false,
        message: 'Recipe successfully deleted from favorites',
      });
    }
    return res.json({
      error: false,
      message: 'Recipe successfully added to favorites',
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.get('/fav', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return error(401, 'Invalid request', res);
  }
  try {
    const recipeFavorite = await models.RecipeFavorite.findAll({
      where: { uid: id },
    });
    if (!recipeFavorite) {
      throw new Error("Couldn't find favortie recipes");
    }
    return res.json({
      error: false,
      body: recipeFavorite,
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.post('/rate/:id/:rating', jwtMiddleware, async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return error(401, 'Invalid request', res);
  }
  try {
    let recipeRating = await models.RecipeRating.findOne({
      where: {
        uid: id,
        rid: req.params.id,
      },
    });
    if (!recipeRating) {
      recipeRating = await models.RecipeRating.create({
        uid: id,
        rid: req.params.id,
        rating: req.params.rating,
      });
      if (!recipeRating) {
        throw new Error("Couldn't create recipe rating");
      }
      return res.json({
        error: false,
        message: 'Recipe rating successfully created',
        body: { rating: recipeRating.rating },
      });
    }
    recipeRating.update({
      rating: req.params.rating,
    });
    if (!recipeRating) {
      throw new Error("Couldn't update recipe rating");
    }
    return res.json({
      error: false,
      message: 'Recipe rating successfully updated',
      body: { rating: recipeRating.rating },
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.get('/rating/:id', async (req, res) => {
  try {
    const recipeRating = await models.RecipeRating.findAll({
      where: {
        rid: req.params.id,
      },
      attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'rating']],
    });
    if (!recipeRating) {
      throw new Error("Couldn't get recipe rating");
    }
    console.log(recipeRating);
    return res.json({
      error: false,
      body: { rating: recipeRating[0].dataValues.rating },
    });
  } catch (err) {
    console.log(err);
    return error(500, 'Internal server error', res);
  }
});

router.get('/search', async (req, res) => {
  const { query, page, pageSize } = req.query;

  if (!query || !page || !pageSize) {
    return error(400, 'Invalid request', res);
  }
  const numberReg = /^\d+$/;
  if (page.match(numberReg) === null || pageSize.match(numberReg) === null) {
    return error(400, 'Invalid page or page size parameter', res);
  }
  try {
    const result = await models.Recipe.findAll({
      limit: pageSize * 1,
      offset: pageSize * (page - 1),
      where: query
        ? {
            name: {
              [sequelize.Op.like]: `%${query}%`,
            },
          }
        : {},
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
