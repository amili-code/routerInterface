const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const setupSocket = require("app/socket");
const cookieParser = require("cookie-parser");
const { syncDatabase } = require('./config/syncDatabase');
require('dotenv').config();

const server = http.createServer(app);

class Application {
    constructor() {
        try {
            this.setupGlobalErrorHandling();  // ✅ اضافه کردن هندلر خطاهای عمومی
            this.setupExpress();
            this.setConfig();
            this.serRouters();
            this.serSocket();
        } catch (error) {
            console.error("خطای کلی در راه‌اندازی برنامه:", error);
        }
    }

    setupExpress() {
        try {
            server.listen(process.env.PORT,'0.0.0.0',() =>
                console.log(`✅ Server is running on port ${process.env.PORT}`)
            );
        } catch (error) {
            console.error("❌ خطا در راه‌اندازی سرور:", error);
        }
    }

    setConfig() {
        try {
            app.use(express.static("public"));
            app.set("views", path.resolve("./app/templates"));
            app.set("view engine", "ejs");
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({ extended: true }));
            app.use(cors());
            app.use(cookieParser());
            app.use(session({
                secret: process.env.JWT_SECRET,
                resave: false,
                saveUninitialized: true,
                cookie: {
                    maxAge: 60 * 60 * 1000, // 20 دقیقه
                    httpOnly: true,// یا 'strict'
                }
            }));
            
            app.use((req, res, next) => {
                if (req.session) {
                    req.session.touch(); // تمدید زمان سشن در هر درخواست
                }
                next();
            });

            if (process.env.DataBaseCreate === "true") {
                // syncDatabase()
                // seedEvents()
            }
        } catch (error) {
            console.error("❌ خطا در تنظیمات برنامه:", error);
        }
    }

    serRouters() {
        try {
            app.use(require("app/routes"));
        } catch (error) {
            console.error("❌ خطا در بارگذاری روترها:", error);
        }
    }

    serSocket() {
        try {
            setupSocket(server);
        } catch (error) {
            console.error("❌ خطا در تنظیمات سوکت:", error);
        }
    }

    setupGlobalErrorHandling() {
        // جلوگیری از کرش شدن برنامه در صورت خطاهای غیرمنتظره
        process.on("uncaughtException", (err) => {
            console.error("❌ خطای بحرانی (uncaughtException):", err);
        });

        process.on("unhandledRejection", (reason, promise) => {
            console.error("❌ خطای مدیریت نشده (unhandledRejection):", reason);
        });
    }
}

module.exports = Application;
