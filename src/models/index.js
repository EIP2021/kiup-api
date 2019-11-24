const User = require('./User');
const UserInfo = require('./UserInfo');
const Consumption = require('./Consumption');
const AlimentComposition = require('./AlimentComposition');
const Aliment = require('./Aliment');
const Recipe = require('./Recipe');
const RecipeFavorite = require('./RecipeFavorite');
const RecipeRating = require('./RecipeRating');

Aliment.belongsTo(AlimentComposition, {
  foreignKey: 'alim_code',
});

AlimentComposition.hasOne(Aliment, {
  foreignKey: 'alim_code',
});

module.exports = {
  User,
  UserInfo,
  Consumption,
  AlimentComposition,
  Aliment,
  Recipe,
  RecipeFavorite,
  RecipeRating,
};
