const Router = require('../model/Routers')
const { executeCommand } = require('../command/routerCommand');
const Profile = require('../model/Profile');
const Req = require('../model/Req');

function generateRandomChars(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
}

class reqController {
    async getAll(req, res) {
        try {
            const reqs = await Req.findAll();
            res.status(200).json(reqs);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
    try {
        const obj = req.body;

        // استخtraction دو رقم اول شماره اتاق
        const roomPrefix = obj.room.toString().padStart(2, '0').slice(0, 2);

        // تولید دو کاراکتر رندوم (الفبا)
        const randomChars = generateRandomChars(2);

        // استخراج دو عدد آخر کد ملی
        const codeSuffix = obj.code.toString().slice(-2);

        // ترکیب تمام بخش‌ها برای تولید یوزرنیم
        const userName = `${roomPrefix}${randomChars}${codeSuffix}`;
        const password = userName
        // اضافه کردن یوزرنیم به آبجکت خروجی
        obj.userName = userName;
        obj.password = password;
        obj.profileId = req.body.profileSelect;

        await Req.create(obj)
        res.status(200).json(obj);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


    async information(req, res) {

        const router = await Router.findByPk(req.params.id);
        if (!router) return res.status(404).json({ message: "روتر پیدا نشد" });

        const data = await executeCommand(router, "/system resource print");

        if (!data) return res.status(500).json({ message: "خطا در دریافت اطلاعات از روتر" });

        // پردازش خروجی و استخراج مقادیر مورد نیاز
        const parsedData = {};
        data.split("\r\n").forEach(line => {
            if (line.includes("uptime:")) parsedData.uptime = line.split("uptime:")[1].trim();
            if (line.includes("platform:")) parsedData.platform = line.split("platform:")[1].trim();
            if (line.includes("cpu-count:")) parsedData.cpu_cores = line.split("cpu-count:")[1].trim();
            if (line.includes("total-memory:")) parsedData.total_memory = line.split("total-memory:")[1].trim();
            if (line.includes("free-memory:")) parsedData.free_memory = line.split("free-memory:")[1].trim();
        });

        // محاسبه میزان حافظه اشغال شده
        const totalMemoryMB = parseFloat(parsedData.total_memory);
        const freeMemoryMB = parseFloat(parsedData.free_memory);
        const usedMemoryMB = (totalMemoryMB - freeMemoryMB).toFixed(2) + "MiB";

        // ساختن پاسخ نهایی
        const result = {
            uptime: parsedData.uptime,
            platform: parsedData.platform,
            cpu_cores: parsedData.cpu_cores,
            total_memory: parsedData.total_memory,
            used_memory: usedMemoryMB,
            free_memory: parsedData.free_memory
        };

        res.status(200).json({ message: "اتصال موفق!", data: result });
    }


    async connection(req, res) {
        try {
            const router = await Router.findByPk(req.params.id);

            if (!router) {
                return res.status(404).json({ message: "روتر پیدا نشد" });
            }

            // تست اتصال با دستور ساده
            const response = await executeCommand(router, '/ip/address/print');
            if (!response)
                res.status(500).json({ message: "اتصال ناموفق" });
            else
                res.status(200).json({ message: "اتصال موفق!", output: response });


        } catch (error) {
            res.status(500).json({ message: "اتصال ناموفق", error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const router = await Router.findByPk(req.params.id);
            if (!router) return res.status(404).json({ error: "روتر پیدا نشد" });
            res.status(200).json(router);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const router = await Router.findByPk(req.params.id);
            if (!router) return res.status(404).json({ error: "روتر پیدا نشد" });

            await router.update(req.body);
            res.status(200).json(router);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }


    async delete(req, res) {
        try {
            const router = await Router.findByPk(req.params.id);
            if (!router) return res.status(404).json({ error: "روتر پیدا نشد" });

            const respes = await executeCommand(router, `user-manager/limitation/remove [find]`)
            const resp = await executeCommand(router, `user-manager/profile/remove [find ]`)
            const respesea = await executeCommand(router, `user-manager/profile-limitation/remove [find]`)
            const respe = await executeCommand(router, `user-manager/user/remove [find]`)
            const respese = await executeCommand(router, `user-manager/user-profile/remove [find]`)
            const hh = await executeCommand(router, `ip/ hotspot/ ip-binding/remove [find]`)


            await router.destroy();
            res.status(200).json({});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}


module.exports = new reqController()