const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

module.exports = sequelize.define('Recipe', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  uid: {
    type: Sequelize.INTEGER,
    notNull: true,
  },
  name: {
    type: Sequelize.CHAR,
    notEmpty: true,
  },
  description: {
    type: Sequelize.CHAR,
    notEmpty: true,
  },
  prepTime: {
    type: Sequelize.INTEGER,
    notNull: true,
  },
  cookTime: {
    type: Sequelize.INTEGER,
  },
  ingredients: Sequelize.JSON,
  steps: Sequelize.JSON,
},
{
  timestamps: false,
});
