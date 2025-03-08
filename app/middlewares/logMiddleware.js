const AdminActivityLog = require("../model/AdminActivityLog");
const { verifyToken } = require("../config/auth");

const logMiddleware = (action) => {
    return async (req, res, next) => {
        try {
            // خواندن توکن از سشن
            const token = req.session.token;

            if (!token) {
                return res.render("403", { host: `${process.env.HOST}:${process.env.PORT}/users` });
            }

            // تایید و دیکود کردن توکن
            const result = verifyToken(token);
            if (!result.login) {
                return res.render("403", { host: `${process.env.HOST}:${process.env.PORT}/users` });
            }


            if (!action) {
                return next(); // اگر مقدار لاگ نال باشد، ثبت نکن و برو سراغ پردازش بعدی
            }



            // ثبت لاگ در دیتابیس
            await AdminActivityLog.create({
                adminId: result.id,
                action: `${result.name} ${action}`,
                route: req.originalUrl,
            });

            next(); // ادامه پردازش درخواست
        } catch (error) {
            console.error("خطا در ذخیره لاگ:", error);
            next(); // برای جلوگیری از توقف پردازش درخواست
        }
    };
};

module.exports = logMiddleware;
