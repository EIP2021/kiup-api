const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

module.exports = sequelize.define('consumption', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: Sequelize.INTEGER,
  date: Sequelize.DATEONLY,
  stats: Sequelize.JSON,
  updatedAt: Sequelize.DATE,
},
{
  timestamps: false,
  tableName: 'Consumption',
});
