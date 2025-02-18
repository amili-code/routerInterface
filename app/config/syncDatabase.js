const { sequelize, connectDB } = require('./database');
const Router = require("../model/Routers")
const Limitation = require("../model/Limitation")

async function syncDatabase() {
    await connectDB();

    try {
        await sequelize.sync({ alter: true }); // ایجاد یا آپدیت جداول
        console.log("✅ جداول دیتابیس با موفقیت همگام‌سازی شد.");
        process.exit();
    } catch (error) {
        console.error("❌ خطا در همگام‌سازی دیتابیس:", error);
        process.exit(1);
    }
}

module.exports = { syncDatabase };
