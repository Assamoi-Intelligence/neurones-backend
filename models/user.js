const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    picture_path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    picture_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    hooks: {
        beforeSave: (user, options) => {
            const salt = bcrypt.genSaltSync(10);
            user.password = bcrypt.hashSync(user.password, salt);
            user.picture_url = 'http://localhost:8000/' + user.picture_path
        }
    }
});

User.prototype.getToken = (user) => {
    return jwt.sign({
        id: user.id,
        email: user.email,
    }, "NEURONES")
}

User.prototype.validatePassword = (passwordInput, passwordHashed) => {
    const result = bcrypt.compareSync(passwordInput, passwordHashed);
    return result;
}

module.exports = User;