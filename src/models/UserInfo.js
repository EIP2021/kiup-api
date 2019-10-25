const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

module.exports = sequelize.define('userInfo', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  firstName: Sequelize.CHAR,
  lastName: Sequelize.CHAR,
  dateOfBirth: Sequelize.DATEONLY,
  gender: Sequelize.CHAR,
  weight: Sequelize.INTEGER, // Kilograms!
},
{
  timestamps: false,
  tableName: 'UserInfo',
});
