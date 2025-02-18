const Limitation = require("../model/Limitation");
const Router = require("../model/Routers");




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
            const limitation = await Limitation.create(req.body);
            res.status(200).json(limitation);
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

            await limitation.update(req.body);
            res.status(200).json(limitation);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const limitation = await Limitation.findByPk(req.params.id);
            if (!limitation) return res.status(404).json({ error: "محدودیت پیدا نشد" });

            await limitation.destroy();
            res.status(200).json({});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new LimitationController();
