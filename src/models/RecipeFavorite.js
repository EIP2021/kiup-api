const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

module.exports = sequelize.define('RecipeFavorite', {
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
},
{
  timestamps: false,
});
