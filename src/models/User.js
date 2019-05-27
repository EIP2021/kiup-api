const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

module.exports = sequelize.define('users', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: Sequelize.CHAR,
  password: Sequelize.CHAR,
  token: Sequelize.CHAR,
  tokenExpires: Sequelize.CHAR,
},
{
  timestamps: false,
  tableName: 'Users',
});
