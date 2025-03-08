const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const Admin = sequelize.define('Admin', {
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
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "رمز عبور نمی‌تواند خالی باشد" },
        },
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: "شماره تلفن نمی‌تواند خالی باشد" },
            isNumeric: { msg: "شماره تلفن باید عدد باشد" },
        },
    },
    nationalCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: "کد ملی نمی‌تواند خالی باشد" },
            isNumeric: { msg: "کد ملی باید عدد باشد" },
            len: { args: [10, 10], msg: "کد ملی باید ۱۰ رقم باشد" },
        },
    },
}, {
    timestamps: true,
    tableName: 'Admins',
});

// **هش کردن رمز عبور قبل از ذخیره در دیتابیس**
Admin.beforeCreate(async (admin) => {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
});

module.exports = Admin;
