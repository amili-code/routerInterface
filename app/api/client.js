const User = require("../model/Client");
const Profile = require("../model/Profile");
const Limitation = require("../model/Limitation");
const Router = require("../model/Routers");
const Session = require("../model/Session");
const { executeCommand } = require("../command/routerCommand");

class ClientController {
    // دریافت لیست همه کاربران
    async getAll(req, res) {
        try {
            const users = await User.findAll({
                include: [
                    {
                        model: Profile,
                        attributes: ["name", "price"],
                    },
                ],
                attributes: { exclude: ["profileId"] },
            });

            const formattedUsers = users.map(user => {
                const { Profile, ...rest } = user.toJSON();
                return {
                    ...rest,
                    profileName: Profile ? Profile.name : null,
                    profilePrice: Profile ? Profile.price : null,
                };
            });

            res.status(200).json(formattedUsers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // دریافت اطلاعات یک کاربر بر اساس ID
    async getOne(req, res) {
        try {
            const user = await User.findByPk(req.params.id, { include: Profile });
            if (!user) return res.status(404).json({ error: "کاربر پیدا نشد" });

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // ایجاد یک کاربر جدید
    async create(req, res) {
        try {
            const { name, username, password, fullName, roomNumber, profileId, ClientCount } = req.body;

            // بررسی وجود پروفایل قبل از ایجاد کاربر

            const profile = await Profile.findByPk(profileId);
            if (!profile) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });
            const limitation = await Limitation.findByPk(profile.limitationId);
            if (!limitation) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });
            const router = await Router.findByPk(limitation.routerId)
            if (!router) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });

            const command = `user-manager/user/add name=${name} password=${password} shared-users=${ClientCount}`
            const relatedCommand = `user-manager/user-profile/add user=${name} profile=${profile.name}`
            console.log(command, relatedCommand);

            const response = await executeCommand(router, command)
            const realtedResponse = await executeCommand(router, relatedCommand)


            const user = await User.create(req.body);

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async allSession(req, res) {
        try {
            const sessions = await Session.findAll({
                attributes: [
                    'callingStationId',
                    'userAddress',
                    'acctSessionId',
                    'started',
                    'uptime',
                    'download',
                    'upload',
                    'lastAccountingPacket'
                ],
                include: [
                    {
                        model: User,
                        attributes: [
                            ['fullname', 'clientFullName'],
                            ['roomNumber', 'clientRoomNumber']
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']],
                raw: true
            });

            // تغییر کلیدهای خروجی برای حذف "Client."
            const formattedSessions = sessions.map(session => ({
                ...session,
                clientFullName: session['Client.clientFullName'],
                clientRoomNumber: session['Client.clientRoomNumber']
            }));

            // حذف فیلدهای اضافی
            formattedSessions.forEach(session => {
                delete session['Client.clientFullName'];
                delete session['Client.clientRoomNumber'];
            });

            res.status(200).json(formattedSessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            res.status(500).json({ message: 'Error fetching sessions' });
        }
    }

    async macSession(req, res) {
        try {
            const { mac, ip, sessionId } = req.query; // دریافت پارامترهای کوئری از درخواست
            console.log(req.query);
            // ایجاد یک شیء where داینامیک برای فیلترها
            const whereClause = {};
            if (mac) whereClause.callingStationId = mac;
            if (ip) whereClause.userAddress = ip;
            if (sessionId) whereClause.acctSessionId = sessionId;

            const sessions = await Session.findAll({
                attributes: [
                    'callingStationId',
                    'userAddress',
                    'acctSessionId',
                    'started',
                    'uptime',
                    'download',
                    'upload',
                    'lastAccountingPacket'
                ],
                include: [
                    {
                        model: User,
                        attributes: [
                            ['fullname', 'clientFullName'],
                            ['roomNumber', 'clientRoomNumber']
                        ]
                    }
                ],
                where: whereClause, // اعمال فیلتر داینامیک
                order: [['createdAt', 'DESC']],
                raw: true
            });

            // تغییر کلیدهای خروجی برای حذف "User."
            const formattedSessions = sessions.map(session => ({
                ...session,
                clientFullName: session['User.clientFullName'],
                clientRoomNumber: session['User.clientRoomNumber']
            }));

            // حذف فیلدهای اضافی
            formattedSessions.forEach(session => {
                delete session['User.clientFullName'];
                delete session['User.clientRoomNumber'];
            });

            res.status(200).json(formattedSessions);
        } catch (error) {
            console.error('Error fetching filtered sessions:', error);
            res.status(500).json({ message: 'Error fetching filtered sessions' });
        }
    }



    async activeUser(req, res) {
        try {
            const users = await User.findAll();
            const activeUsers = [];

            for (const user of users) {
                // پیدا کردن روتر مربوط به این یوزر
                const profile = await Profile.findByPk(user.profileId);
                if (!profile) continue;

                const limitation = await Limitation.findByPk(profile.limitationId);
                if (!limitation) continue;

                const router = await Router.findByPk(limitation.routerId);
                if (!router) continue;

                // **📌 دریافت سشن‌های کلی از میکروتیک**
                const sessionCommand = `user-manager/session/print where user=${user.name}`;
                const sessionResponse = await executeCommand(router, sessionCommand);

                if (sessionResponse) {
                    const sessionRegex = /user=(\d+).*?acct-session-id="([^"]+)".*?nas-port-type=([^ ]+).*?nas-port-id="([^"]+)".*?nas-ip-address=([\d.]+).*?calling-station-id="([^"]+)".*?user-address=([\d.]+).*?status=([^ ]+).*?started=([\d-]+\s[\d:]+).*?(?:ended=([\d-]+\s[\d:]+))?.*?(?:terminate-cause=([\w-]+))?.*?uptime=([\w\d]+).*?download=([\w\d.]+).*?upload=([\w\d.]+).*?last-accounting-packet=([\d-]+\s[\d:]+)/gs;

                    let match;
                    while ((match = sessionRegex.exec(sessionResponse)) !== null) {
                        const [, userId, acctSessionId, nasPortType, nasPortId, nasIpAddress, callingStationId, userAddress, status, started, ended, terminateCause, uptime, download, upload, lastAccountingPacket] = match;

                        // بررسی وجود سشن در دیتابیس
                        const existingSession = await Session.findOne({ where: { acctSessionId } });

                        if (!existingSession) {
                            // اگر وجود ندارد، آن را اضافه کن
                            await Session.create({
                                userId: user.id,
                                acctSessionId,
                                nasPortType,
                                nasPortId,
                                nasIpAddress,
                                callingStationId,
                                userAddress,
                                status,
                                started: started ? new Date(started) : null,
                                ended: ended ? new Date(ended) : null,
                                terminateCause: terminateCause || null,
                                uptime,
                                download,
                                upload,
                                lastAccountingPacket: lastAccountingPacket ? new Date(lastAccountingPacket) : null,
                            });
                        } else {
                            // بررسی و به‌روزرسانی فقط در صورتی که مقدار جدیدی آمده باشد
                            const updatedFields = {};
                            if (existingSession.nasPortType !== nasPortType) updatedFields.nasPortType = nasPortType;
                            if (existingSession.nasPortId !== nasPortId) updatedFields.nasPortId = nasPortId;
                            if (existingSession.nasIpAddress !== nasIpAddress) updatedFields.nasIpAddress = nasIpAddress;
                            if (existingSession.callingStationId !== callingStationId) updatedFields.callingStationId = callingStationId;
                            if (existingSession.userAddress !== userAddress) updatedFields.userAddress = userAddress;
                            if (existingSession.status !== status) updatedFields.status = status;
                            if (existingSession.started?.toISOString() !== new Date(started)?.toISOString()) updatedFields.started = new Date(started);
                            if (ended && !isNaN(new Date(ended))) {
                                if (existingSession.ended?.toISOString() !== new Date(ended).toISOString()) {
                                    updatedFields.ended = new Date(ended);
                                }
                            } if (existingSession.terminateCause !== terminateCause) updatedFields.terminateCause = terminateCause;
                            if (existingSession.uptime !== uptime) updatedFields.uptime = uptime;
                            if (existingSession.download !== download) updatedFields.download = download;
                            if (existingSession.upload !== upload) updatedFields.upload = upload;
                            if (existingSession.lastAccountingPacket?.toISOString() !== new Date(lastAccountingPacket)?.toISOString()) updatedFields.lastAccountingPacket = new Date(lastAccountingPacket);

                            // اگر فیلدی برای آپدیت وجود داشت، اطلاعات را به‌روز کن
                            if (Object.keys(updatedFields).length > 0) {
                                const db = await existingSession.update(updatedFields);
                                console.log(db);
                            }
                        }
                    }

                }

                // **📌 دریافت کاربران اکتیو**
                const activeCommand = `user-manager/session/print where active=yes user=${user.name}`;
                const activeResponse = await executeCommand(router, activeCommand);

                if (activeResponse) {
                    const activeSessionRegex = /user=(\d+).*?acct-session-id="([^"]+)".*?nas-port-type=([^ ]+).*?nas-port-id="([^"]+)".*?nas-ip-address=([\d.]+).*?calling-station-id="([^"]+)".*?user-address=([\d.]+).*?status=([^ ]+).*?started=([\d-]+\s[\d:]+).*?uptime=([\w\d]+).*?download=([\w\d.]+).*?upload=([\w\d.]+).*?last-accounting-packet=([\d-]+\s[\d:]+)/gs;

                    let activeMatch;
                    while ((activeMatch = activeSessionRegex.exec(activeResponse)) !== null) {
                        const [, userId, acctSessionId, nasPortType, nasPortId, nasIpAddress, callingStationId, userAddress, status, started, uptime, download, upload, lastAccountingPacket] = activeMatch;

                        activeUsers.push({
                            userName: user.name,
                            roomNumber: user.roomNumber,
                            acctSessionId,
                            callingStationId,
                            userAddress,
                            started,
                            uptime,
                            download,
                            upload,
                            lastAccountingPacket,
                        });
                    }
                }
            }

            res.status(200).json(activeUsers);
        } catch (error) {
            console.error("Error fetching active users:", error);
            res.status(500).json({ error: error.message });
        }
    }


    // بروزرسانی اطلاعات کاربر
    async update(req, res) {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ error: "کاربر پیدا نشد" });

            const { name, username, password, fullName, roomNumber, profileId, ClientCount } = req.body;

            const profile = await Profile.findByPk(profileId);
            if (!profile) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });
            const limitation = await Limitation.findByPk(profile.limitationId);
            if (!limitation) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });
            const router = await Router.findByPk(limitation.routerId)
            if (!router) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });

            if (profileId != user.profileId) {
                const relatedCommand = `user-manager/user-profile/remove [find User=${user.name}]`
                const relatedCommandResult = await executeCommand(router, relatedCommand)
                const addRelatedCommand = `user-manager/user-profile/add user=${name} profile=${profile.name}`
                const addRelatedCommandResult = await executeCommand(router, addRelatedCommand)
            }


            // const command = `user-manager/user/remove [find name=${user.name}]`
            // const commandResult = await executeCommand(router, command)

            const addCommand = `user-manager/user/set [find name="${user.name}"] name=${name} password=${password} shared-users=${ClientCount}`
            const addCommandResult = await executeCommand(router, addCommand)




            await user.update(req.body);



            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // حذف کاربر
    async delete(req, res) {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ error: "کاربر پیدا نشد" });


            const profile = await Profile.findByPk(user.profileId);
            if (!profile) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });
            const limitation = await Limitation.findByPk(profile.limitationId);
            if (!limitation) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });
            const router = await Router.findByPk(limitation.routerId)
            if (!router) return res.status(404).json({ error: "پروفایل مرتبط پیدا نشد" });

            const relatedCommand = `user-manager/user-profile/remove [find user=${user.name}]`
            const command = `user-manager/user/remove [find name=${user.name}]`
            console.log(command, relatedCommand);

            const realtedResponse = await executeCommand(router, relatedCommand)
            const response = await executeCommand(router, command)



            await user.destroy();
            res.status(200).json({ message: "کاربر حذف شد" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ClientController();
