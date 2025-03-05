const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    acctSessionId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nasPortType: DataTypes.STRING,
    nasPortId: DataTypes.STRING,
    nasIpAddress: DataTypes.STRING,
    callingStationId: DataTypes.STRING,
    userAddress: DataTypes.STRING,
    status: DataTypes.STRING,
    started: DataTypes.DATE,
    ended: DataTypes.DATE,
    terminateCause: DataTypes.STRING,
    uptime: DataTypes.STRING,
    download: DataTypes.STRING,
    upload: DataTypes.STRING,
    lastAccountingPacket: DataTypes.DATE,
}, {
    timestamps: true,
    tableName: 'Sessions'
});

module.exports = Session;
