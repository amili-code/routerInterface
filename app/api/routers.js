const Router = require('../model/Routers')

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
            res.status(201).json(router);
        } catch (error) {
            res.status(400).json({ error: error.message });
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
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}


module.exports = new routerController()