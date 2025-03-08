const BlockedClient = require("../model/BlockedClient");
const Client = require("../model/Client");
const Profile = require("../model/Profile");
const Limitation = require("../model/Limitation");
const Router = require("../model/Routers");
const BlockedMac = require("../model/BlockedMac");
const { executeCommand } = require("../command/routerCommand");
const Session = require("../model/Session");
const { Op , Sequelize } = require('sequelize');
const moment = require('jalali-moment'); // برای تبدیل تاریخ


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

    async getAllProp(req, res) {
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

    async useage(req, res) {
        try {
            // تاریخ ۷ روز قبل را محاسبه کن
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // دریافت داده‌ها از دیتابیس
            const sessions = await Session.findAll({
                attributes: [
                    [Sequelize.fn('DATE', Sequelize.col('started')), 'date'],
                    [Sequelize.fn('SUM', Sequelize.col('download')), 'totalDownload'],
                    [Sequelize.fn('SUM', Sequelize.col('upload')), 'totalUpload']
                ],
                where: {
                    started: {
                        [Op.gte]: sevenDaysAgo
                    }
                },
                group: ['date'],
                order: [[Sequelize.literal('date'), 'ASC']]
            });

            // پردازش داده‌ها
            const result = sessions.map(session => {
                const gregorianDate = session.getDataValue('date'); // تاریخ میلادی
                const persianDate = moment(gregorianDate).locale('fa').format('YYYY-MM-DD'); // تبدیل به شمسی
                const persianWeekday = moment(gregorianDate).locale('fa').format('dddd'); // نام روز هفته

                return {
                    date: persianDate,
                    weekday: persianWeekday,
                    totalDownload: session.getDataValue('totalDownload'),
                    totalUpload: session.getDataValue('totalUpload'),
                    totalTraffic: session.getDataValue('totalDownload') + session.getDataValue('totalUpload'),
                };
            });

            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'خطایی رخ داده است.' });
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
            const { clientId, reason, clientName } = req.body;
            // بررسی وجود کاربر

            const client = await Client.findByPk(clientId);
            if (!client) return res.status(404).json({ error: "کاربر پیدا نشد" });
            const profile = await Profile.findByPk(client.profileId);
            if (!profile) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });
            const limitation = await Limitation.findByPk(profile.limitationId);
            if (!limitation) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });
            const router = await Router.findByPk(limitation.routerId)
            if (!router) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });


            const blockClient = await BlockedClient.create(req.body)
            const command = `user-manager/user/set [find name="${client.name}"] disable=yes`
            const response = await executeCommand(router, command)

            res.status(201).json(blockClient);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAllMac(req, res) {
        try {
            const blockedMacs = await BlockedMac.findAll({
                attributes: { exclude: ["sessionId"] }
            }); // دریافت تمام داده‌ها

            if (!blockedMacs.length) {
                return res.status(200).json({ message: "هیچ MAC بلاک شده‌ای یافت نشد!" });
            }

            res.json(blockedMacs);
        } catch (error) {
            console.error("خطا در دریافت لیست MAC های بلاک‌شده:", error);
            res.status(500).json({ message: "خطای سرور! لطفاً دوباره امتحان کنید." });
        }
    }

    async macBlocker(req, res) {
        try {
            const { comment, mac } = req.body; // گرفتن توضیحات از درخواست

            const session = await Session.findOne({ where: { callingStationId: mac } });
            if (!session) res.status(404).json({ message: 'Session not found' });
            const user = await Client.findOne({ where: { name: session.userName } });
            if (!user) res.status(404).json('user not founded')
            const profile = await Profile.findByPk(user.profileId);
            if (!profile) res.status(404).json('Profile not founded')
            const limitation = await Limitation.findByPk(profile.limitationId);
            if (!limitation) res.status(404).json('Limitation not founded')
            const router = await Router.findByPk(limitation.routerId);
            if (!router) res.status(404).json('Router not founded')


            const blockedUser = await BlockedMac.create({
                macAddress: session.callingStationId,
                blockedIp: session.userAddress,
                sessionId: session.id,
                comment: comment || 'Blocked due to policy',
            });


            const response = await executeCommand(router, ` ip/ hotspot/ ip-binding/ add mac-address=${mac} type=blocked comment="block mac`)



            res.json({ message: 'User blocked successfully', blockedUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async macBack(req, res) {
        try {
            const blockMac = await BlockedMac.findOne({ where: { macAddress: req.params.mac } })
            if (!blockMac) res.status(404).json({ message: 'blockMac not found' });
            const session = await Session.findOne({ where: { callingStationId: blockMac.macAddress } });
            if (!session) res.status(404).json({ message: 'Session not found' });
            const user = await Client.findOne({ where: { name: session.userName } });
            if (!user) res.status(404).json('user not founded')
            const profile = await Profile.findByPk(user.profileId);
            if (!profile) res.status(404).json('Profile not founded')
            const limitation = await Limitation.findByPk(profile.limitationId);
            if (!limitation) res.status(404).json('Limitation not founded')
            const router = await Router.findByPk(limitation.routerId);
            if (!router) res.status(404).json('Router not founded')

            const response = await executeCommand(router, `ip/ hotspot/ ip-binding/ remove [find mac-address=${req.params.mac}] `)
            await blockMac.destroy();


            res.status(200).json({ message: "کاربر از لیست مسدود شده حذف شد" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    async macSession(req, res) {
        try {

            const macSession = await Session.findAll({
                where: {
                    callingStationId: req.params.mac
                },
                attributes: { exclude: [ "userId","id","nasIpAddress", "status", "ended", "nasPortId", "nasPortType", "terminateCause"]}
            })

            res.status(200).json(macSession);
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

            const client = await Client.findByPk(blockedClient.clientId);
            if (!client) return res.status(404).json({ error: "کاربر پیدا نشد" });
            const profile = await Profile.findByPk(client.profileId);
            if (!profile) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });
            const limitation = await Limitation.findByPk(profile.limitationId);
            if (!limitation) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });
            const router = await Router.findByPk(limitation.routerId)
            if (!router) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });

            const command = `user-manager/user/set [find name="${client.name}"] disable=no`
            const response = await executeCommand(router, command)


            await blockedClient.destroy();
            res.status(200).json({ message: "کاربر از لیست مسدود شده حذف شد" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new BlockedClientController();
