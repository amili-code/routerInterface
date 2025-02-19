const Router = require('../model/Routers')
const { executeCommand } = require('../command/routerCommand');

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

    async connection(req, res) {
        try {
            console.log(req.params.id);
            const router = await Router.findByPk(req.params.id);

            if (!router) {
                return res.status(404).json({ message: "روتر پیدا نشد" });
            }

            // دستور ساده‌ای مثل "uptime" رو تست می‌کنیم که نشون بده اتصال موفق بوده
            const response = await executeCommand(router, '/ip/address/print');

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