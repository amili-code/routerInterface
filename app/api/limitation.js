const Limitation = require("../model/Limitation");
const Router = require("../model/Routers");
const { executeCommand } = require('../command/routerCommand');




class LimitationController {
    async getAll(req, res) {
        try {
            const limitations = await Limitation.findAll({
                include: [
                    {
                        model: Router,
                        attributes: ["name"], // فقط فیلد name از Router دریافت شود
                    },
                ],
                attributes: { exclude: ["routerId"] }, // حذف فیلد routerId
            });

            // تغییر ساختار داده‌ها
            const formattedLimitations = limitations.map(limitation => {
                const { Router, updatedAt, createdAt, ...rest } = limitation.toJSON();
                return {
                    ...rest, // سایر فیلدهای Limitation
                    routerName: Router.name, // مقدار name از Router را در routerName ذخیره کن
                    updatedAt, // به ترتیب حفظ شود
                    createdAt, // آخرین فیلد قرار بگیرد
                };
            });

            res.status(200).json(formattedLimitations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }



    async create(req, res) {
        try {
            const router = await Router.findByPk(req.body.routerId)
            const { download, upload, name, tx, rx, timeLimit } = req.body
            executeCommand(router, `user-manager/limitation/add download-limit=${download}G upload-limit=${upload}G name=${name} rate-limit-tx=${tx}M rate-limit-rx=${rx}M uptime-limit=${timeLimit}`).
                then(async () => {
                    const limitation = await Limitation.create(req.body);
                    res.status(200).json(limitation);
                }).catch((error) => {
                    res.status(400).json({ error: error.message });
                })
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const limitation = await Limitation.findByPk(req.params.id, { include: Router });
            if (!limitation) return res.status(404).json({ error: "محدودیت پیدا نشد" });
            res.status(200).json(limitation);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const limitation = await Limitation.findByPk(req.params.id);
            if (!limitation) return res.status(404).json({ error: "محدودیت پیدا نشد" });


            // دریافت اطلاعات روتر مرتبط
            const router = await Router.findByPk(req.body.routerId);

            // اجرای دستور برای ویرایش محدودیت روی روتر
            const { download, upload, name, tx, rx, timeLimit } = req.body;
            const command = `/user-manager limitation set [find where name="${name}"] download-limit=${download}G upload-limit=${upload}G rate-limit-tx=${tx}M rate-limit-rx=${rx}M uptime-limit=${timeLimit}`;

            // اجرای دستور روی روتر
            const response = await executeCommand(router, command);

            const result = await limitation.update(req.body);
            // به‌روزرسانی محدودیت در دیتابیس
            res.status(200).json(limitation); // ارسال نتیجه به‌روزرسانی به کلاینت
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }




    async delete(req, res) {
        try {
            const limitation = await Limitation.findByPk(req.params.id);
            if (!limitation) return res.status(404).json({ error: "محدودیت پیدا نشد" });
            const router = await Router.findByPk(limitation.routerId)
            const response = await executeCommand(router, `user-manager limitation/remove [find name="${limitation.name}"]`);
            await limitation.destroy();
            res.status(200).json({});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAllRouter(req, res) {
        try {
            // دریافت محدودیت‌های دیتابیس
            const limitations = await Limitation.findAll({
                include: [{ model: Router, attributes: ["name"] }],
                attributes: { exclude: ["routerId"] },
            });

            // دریافت لیست روترها
            const routers = await Router.findAll();

            // اجرای دستورات روی همه روترها و دریافت اطلاعات محدودیت‌ها
            const allLimitPromises = routers.map(async (router) => {
                const limits = await executeCommand(router, `user-manager limitation print`);
                return limits ? { routerName: router.name, limits } : null;
            });

            // دریافت نتایج و فیلتر کردن روترهایی که داده‌ای برنگرداندند
            let allLimits = (await Promise.all(allLimitPromises)).filter(Boolean);

            // پیدا کردن محدودیت‌هایی که در دیتابیس هستند ولی روی روترها نیستند
            const missingLimitations = limitations.filter((dbLimit) => {
                const routerLimits = allLimits.find((r) => r.routerName === dbLimit.Router.name);
                if (!routerLimits || !routerLimits.limits) return true; // اگر اطلاعاتی از روتر دریافت نشد
                return !routerLimits.limits.includes(dbLimit.name); // بررسی وجود نام در لیست محدودیت‌های روتر
            });

            res.status(200).json(missingLimitations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = new LimitationController();
