const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

module.exports = sequelize.define('recipe', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  uid: Sequelize.INTEGER,
  name: Sequelize.CHAR,
  description: Sequelize.CHAR,
  time: Sequelize.JSON,
  ingredients: Sequelize.JSON,
  steps: Sequelize.JSON },
  { timestamps: false,
});
