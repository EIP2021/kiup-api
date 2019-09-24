const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

module.exports = sequelize.define('recipe', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.CHAR,
  description: Sequelize.CHAR,
  steps: Sequelize.TEXT,
},
{
  timestamps: false,
  tableName: 'recipe',
});
