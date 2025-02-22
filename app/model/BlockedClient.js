const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Client = require('./Client');

const BlockedClient = sequelize.define('BlockedClient', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    clientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Client,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'BlockedClients',
});

// ارتباط با Client
Client.hasOne(BlockedClient, { foreignKey: 'clientId' });
BlockedClient.belongsTo(Client, { foreignKey: 'clientId' });

module.exports = BlockedClient;
