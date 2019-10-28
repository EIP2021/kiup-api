const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

module.exports = sequelize.define('aliment', {
  alim_code: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  name: Sequelize.CHAR,
  composition: Sequelize.JSON,
},
{
  timestamps: false,
  tableName: 'AlimentsComposition',
});
