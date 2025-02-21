const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Profile = require('./Profile');

const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
    fullName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    roomNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "شماره اتاق نمی‌تواند خالی باشد" },
        },
    },
    profileId: {
        type: DataTypes.INTEGER,
        references: {
            model: Profile,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    ClientCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
            isInt: { msg: "تعداد کاربران باید عدد باشد" },
            min: { args: [1], msg: "تعداد کاربران نمی‌تواند کمتر از ۱ باشد" },
        },
    },
}, {
    timestamps: true,
    tableName: 'Clients'
});

// ارتباط با Profile
Profile.hasMany(Client, { foreignKey: 'profileId' });
Client.belongsTo(Profile, { foreignKey: 'profileId' });

module.exports = Client;
