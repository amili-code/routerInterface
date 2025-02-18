const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Router = require('./Routers');

const Limitation = sequelize.define('Limitation', {
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
    download: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: { msg: "دانلود باید عدد باشد" },
        },
    },
    upload: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: { msg: "آپلود باید عدد باشد" },
        },
    },
    tx: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: { msg: "TX باید عدد باشد" },
        },
    },
    rx: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: { msg: "RX باید عدد باشد" },
        },
    },
    timeLimit: {
        type: DataTypes.INTEGER, // بر حسب دقیقه
        allowNull: false,
        validate: {
            isInt: { msg: "محدودیت زمانی باید عدد باشد" },
            min: { args: [1], msg: "حداقل مقدار باید 1 دقیقه باشد" },
        },
    },
    routerId: {
        type: DataTypes.INTEGER,
        references: {
            model: Router,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
    tableName: 'limitations'
});

Router.hasMany(Limitation, { foreignKey: 'routerId' });
Limitation.belongsTo(Router, { foreignKey: 'routerId' });

module.exports = Limitation;
