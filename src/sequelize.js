const Sequelize = require('sequelize');
const config = require('../config.json');

const sequelize = new Sequelize(config.db.db, config.db.user, config.db.password, {
  pool: {
    max: 5,
    min: 0,
    idle: 20000,
    acquire: 20000,
  },
  port: config.db.port,
  host: config.db.host,
  dialect: config.db.dialect,
});

module.exports = sequelize;
