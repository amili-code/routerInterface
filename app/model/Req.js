const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Profile = require('./Profile');

const Req = sequelize.define('Req', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userName: {
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
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    family: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    room: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    count: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    profileId: {
        type: DataTypes.INTEGER,
        references: {
            model: Profile,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
    tableName: 'reqs'
});

Profile.hasMany(Req, { foreignKey: 'profileId' });
Req.belongsTo(Profile, { foreignKey: 'profileId' });

module.exports = Req;