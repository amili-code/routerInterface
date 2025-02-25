const BlockedClient = require("../model/BlockedClient");
const Client = require("../model/Client");

class BlockedClientController {
    // دریافت لیست تمام کاربران مسدود شده
    async getAll(req, res) {
        try {
            const blockedClients = await BlockedClient.findAll({
                include: [{
                    model: Client, attributes: ["name", "roomNumber", "fullName"]
                }],
                attributes: { exclude: ["clientId"] },
            });

            const formattedBlockedClients = blockedClients.map(blockedClient => {
                const { Client, ...rest } = blockedClient.toJSON();
                return {
                    clientName: Client ? Client.name : null,
                    clientRoomNumber: Client ? Client.roomNumber : null,
                    fullName: Client ? Client.fullName : null,
                    ...rest,
                };
            });

            res.status(200).json(formattedBlockedClients);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAllProp(req ,res) {
        try {
            const blockedClients = await BlockedClient.findAll({
                include: [{
                    model: Client, attributes: ["name", "roomNumber", "fullName"]
                }],
            });

            const formattedBlockedClients = blockedClients.map(blockedClient => {
                const { Client, ...rest } = blockedClient.toJSON();
                return {
                    clientName: Client ? Client.name : null,
                    clientRoomNumber: Client ? Client.roomNumber : null,
                    fullName: Client ? Client.fullName : null,
                    ...rest,
                };
            });

            res.status(200).json(formattedBlockedClients);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    // دریافت اطلاعات یک کاربر مسدود شده بر اساس ID
    async getOne(req, res) {
        try {
            const blockedClient = await BlockedClient.findByPk(req.params.id, {
                include: Client,
            });
            if (!blockedClient)
                return res.status(404).json({ error: "کاربر مسدود شده پیدا نشد" });

            res.status(200).json(blockedClient);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // ایجاد یک رکورد جدید برای مسدود کردن کاربر
    async create(req, res) {
        try {
            const { clientId, reason } = req.body;
            // بررسی وجود کاربر
            console.log(req.body);
            const client = await Client.findByPk(clientId);
            if (!client) return res.status(404).json({ error: "کاربر پیدا نشد" });
            console.log(client);
            
            const blockClient = await BlockedClient.create(req.body)
            console.log(blockClient);

            res.status(201).json(blockClient);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // بروزرسانی اطلاعات یک کاربر مسدود شده
    async update(req, res) {
        try {
            const blockedClient = await BlockedClient.findByPk(req.params.id);
            if (!blockedClient)
                return res.status(404).json({ error: "کاربر مسدود شده پیدا نشد" });

            await blockedClient.update(req.body);
            res.status(200).json(blockedClient);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // حذف کاربر از لیست مسدود شده
    async delete(req, res) {
        try {
            const blockedClient = await BlockedClient.findByPk(req.params.id);
            if (!blockedClient)
                return res.status(404).json({ error: "کاربر مسدود شده پیدا نشد" });

            await blockedClient.destroy();
            res.status(200).json({ message: "کاربر از لیست مسدود شده حذف شد" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new BlockedClientController();
