const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

module.exports = sequelize.define('recipefavorite', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  uid: Sequelize.INTEGER,
  rid: Sequelize.INTEGER, },
  { timestamps: false},
);
