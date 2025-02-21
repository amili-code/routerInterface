const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Limitation = require('./Limitation');

const Profile = sequelize.define('Profile', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true,
        validate: {
            notEmpty: { msg: "نام نمی‌تواند خالی باشد" },
        },
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isInt: { msg: "قیمت باید عدد باشد" },
        },
    },
    startDate: {
        type: DataTypes.ENUM('first_use', 'on_login'),
        allowNull: false,
        validate: {
            isIn: { args: [['first_use', 'on_login']], msg: "تاریخ شروع نامعتبر است" },
        },
    },
    weekDays: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "روزهای هفته نمی‌تواند خالی باشد" },
        },
    },
    limitationId: {
        type: DataTypes.INTEGER,
        references: {
            model: Limitation,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
    tableName: 'profiles'
});

Limitation.hasMany(Profile, { foreignKey: 'limitationId' });
Profile.belongsTo(Limitation, { foreignKey: 'limitationId' });
module.exports = Profile;