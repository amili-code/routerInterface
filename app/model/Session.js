const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Client = require('./Client');

const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Client,
            key: 'id',
        },
        onDelete: 'CASCADE',
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

// ارتباط با Client
Client.hasMany(Session, { foreignKey: 'userId' });
Session.belongsTo(Client, { foreignKey: 'userId' });

module.exports = Session;
