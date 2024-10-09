const {Sequelize} = require('sequelize');
const sequelize = new Sequelize('neurones', 'postgres', '@sog7777', {
    host: 'localhost',
    dialect: 'postgres'
});
module.exports = sequelize;