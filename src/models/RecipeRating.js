const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

module.exports = sequelize.define('RecipeRating', {
  uid: {
    type: Sequelize.INTEGER,
    notNull: true,
    primaryKey: true,
  },
  rid: {
    type: Sequelize.INTEGER,
    notNull: true,
    primaryKey: true,
  },
  rating: {
    type: Sequelize.INTEGER,
    notNull: true,
    min: 1,
    max: 5,
  },
},
{
  timestamps: false,
});
