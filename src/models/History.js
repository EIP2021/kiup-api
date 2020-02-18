const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

module.exports = sequelize.define('history', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: Sequelize.INTEGER,
  alimCode: Sequelize.INTEGER,
  barcode: Sequelize.STRING,
  recipeId: Sequelize.INTEGER,
  createdAt: Sequelize.DATE,
},
{
  timestamps: false,
  tableName: 'History',
});
