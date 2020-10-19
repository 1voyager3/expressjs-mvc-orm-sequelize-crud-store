const Sequelize = require('sequelize');

//arguments: database name, user name, user's password
const sequelize = new Sequelize(
    'node-complete', 'root', '12345678', {
        dialect: 'mysql',
        host: 'localhost'
    });

module.exports = sequelize;