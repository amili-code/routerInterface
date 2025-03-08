const AdminActivityLog = require("../model/AdminActivityLog");
const { verifyToken } = require('../config/auth');

const adminLogger = async (req, res, next) => {
    try {
        const token = req.session.token;

        if (!token) {
            return res.status(403).json({ message: "دسترسی غیرمجاز" });
        }

        const result = verifyToken(token);

        if (!result || !result.login) {
            return res.status(403).json({ message: "احراز هویت نامعتبر" });
        }

        const adminId = result.id;

        // تعیین نوع عملیات
        let action = "عملیات نامشخص";
        if (req.method === "GET") action = "گرفت";
        if (req.method === "POST") action = "افزود";
        if (req.method === "PUT") action = "بروزرسانی کرد";
        if (req.method === "DELETE") action = "حذف کرد";

        // استخراج نام اصلی مسیر و تولید پیام مناسب
        const routeMap = {
            "/register": "ادمین",
            "/login": "ادمین وارد شد",
            "/logout": "ادمین خارج شد",
            "/useage": "میزان مصرف",
            "/loger": "لاگ فعالیت‌های کاربران ستاره دار",
            "/req": "درخواست ها",
            "/routers": "روتر",
            "/limitation": "محدودیت",
            "/profile": "پروفایل ",
            "/client": "کاربران",
            "/block-client": "کاربر مسدود شده",
            "/block-mac": "مک آدرس مسدود شده ",
            "/mac": "اطلاعات مک آدرس",
        };

        let routeDescription = "مسیری ناشناخته";

        // بررسی مسیرهای خاص برای تغییر متن بر اساس متد
        for (let key in routeMap) {
            if (req.path.startsWith(key)) {
                if (req.method === "GET") {
                    if (req.path.match(/\/\d+$/)) {
                        routeDescription = `اطلاعات یک ${routeMap[key]} را مشاهده کرد`;
                    } else {
                        routeDescription = `لیست ${routeMap[key]} را مشاهده کرد`;
                    }
                } else if (req.method === "POST") {
                    routeDescription = `${routeMap[key]} را افزود`;
                } else if (req.method === "PUT") {
                    routeDescription = `${routeMap[key]} را بروزرسانی کرد`;
                } else if (req.method === "DELETE") {
                    routeDescription = `${routeMap[key]} را حذف کرد`;
                }
                break;
            }
        }

        await AdminActivityLog.create({
            adminId,
            action,
            route: `${result.name} ${routeDescription}`
        });

        next();
    } catch (error) {
        console.error("خطا در لاگ‌گیری فعالیت:", error);
        next();
    }
};

module.exports = adminLogger;
