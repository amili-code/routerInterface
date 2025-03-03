const Router = require('../model/Routers')
const { executeCommand } = require('../command/routerCommand');
const { response } = require('express');

class routerController {
    async getAll(req, res) {
        try {
            const routers = await Router.findAll();
            res.status(200).json(routers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const router = await Router.create(req.body);
            res.status(200).json(router);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }


  async  information(req, res) {

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
        if(!response)
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

            await router.destroy();
            res.status(200).json({});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}


module.exports = new routerController()