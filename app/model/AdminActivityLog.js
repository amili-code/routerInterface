const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Admin = require("./Admin");

const AdminActivityLog = sequelize.define(
    "AdminActivityLog",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        adminId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Admin,
                key: "id",
            },
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        route: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: true,
        tableName: "AdminActivityLogs",
    }
);

Admin.hasMany(AdminActivityLog, { foreignKey: "adminId" });
AdminActivityLog.belongsTo(Admin, { foreignKey: "adminId" });

module.exports = AdminActivityLog;
