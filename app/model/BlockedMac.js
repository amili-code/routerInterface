const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Session = require('./Session');

const BlockedUser = sequelize.define('BlockedUser', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    macAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    blockedIp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sessionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Session,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'BlockedUsers'
});

// ارتباط با Session
Session.hasMany(BlockedUser, { foreignKey: 'sessionId' });
BlockedUser.belongsTo(Session, { foreignKey: 'sessionId' });

module.exports = BlockedUser;
