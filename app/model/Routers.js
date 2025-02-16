const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Router = sequelize.define('Router', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "نام نمی‌تواند خالی باشد" },
        },
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "نام کاربری نمی‌تواند خالی باشد" },
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "رمز عبور نمی‌تواند خالی باشد" },
        },
    },
    ip: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIP: { msg: "آدرس IP معتبر نیست" },
        },
    },
    port: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: { msg: "پورت باید عدد باشد" },
            min: { args: [1], msg: "پورت معتبر نیست" },
        },
    },
}, {
    timestamps: true,
    tableName: 'routers'
});

module.exports = Router;
