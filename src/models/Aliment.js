const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

module.exports = sequelize.define('aliment', {
  alim_code: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  alim_nom_fr: Sequelize.CHAR,
  alim_ssgrp_code: Sequelize.INTEGER,
},
{
  timestamps: false,
  tableName: 'Aliments',
});
