const User = require("../model/Client");
const Profile = require("../model/Profile");
const Limitation = require("../model/Limitation");
const Router = require("../model/Routers");
const Session = require("../model/Session");
const { executeCommand } = require("../command/routerCommand");


function parseSessionData(sessionResponse) {
    const extractValue = (text, pattern) => {
        const match = text.match(pattern);
        return match ? match[1] : null;
    };

    // 🔥 بهبود روش جدا کردن سشن‌ها
    const sessionBlocks = sessionResponse.split(/\n\s*\d+\s+A?\s+user=/g).filter(block => block.trim());

    const sessions = [];

    for (const block of sessionBlocks) {
        const acctSessionId = extractValue(block, /acct-session-id="(\d+)"/);
        const nasPortType = extractValue(block, /nas-port-type=(\S+)/);
        const nasPortId = extractValue(block, /nas-port-id="(\S+)"/);
        const nasIpAddress = extractValue(block, /nas-ip-address=(\S+)/);
        const callingStationId = extractValue(block, /calling-station-id="([\w:]+)"/);
        const userAddress = extractValue(block, /user-address=(\S+)/);
        const status = extractValue(block, /status=([\w,]+)/);
        const started = extractValue(block, /started=([\d-]+\s+[\d:]+)/);
        const ended = extractValue(block, /ended=([\d-]+\s+[\d:]+)/);
        const terminateCause = extractValue(block, /terminate-cause=(\S+)/);
        const uptime = extractValue(block, /uptime=([\w\d]+)/);
        const download = extractValue(block, /download=([\w\d.]+)/);
        const upload = extractValue(block, /upload=([\w\d.]+)/);
        const lastAccountingPacket = extractValue(block, /last-accounting-packet=([\d-]+\s+[\d:]+)/);

        sessions.push({
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
    }

    return sessions;
}

function parseActiveSessions(activeResponse) {
    const extractValue = (text, pattern) => {
        const match = text.match(pattern);
        return match ? match[1] : null;
    };

    // 🔥 جداسازی بلاک‌های مربوط به هر سشن
    const sessionBlocks = activeResponse.split(/\n\s*\d+\s+A\s+user=/g).filter(block => block.trim());

    const activeSessions = [];

    for (const block of sessionBlocks) {
        const userName = extractValue(block, /user=(\w+)/);
        const acctSessionId = extractValue(block, /acct-session-id="(\d+)"/);
        const nasPortType = extractValue(block, /nas-port-type=(\S+)/);
        const nasPortId = extractValue(block, /nas-port-id="(\S+)"/);
        const nasIpAddress = extractValue(block, /nas-ip-address=([\d.]+)/);
        const callingStationId = extractValue(block, /calling-station-id="([\w:]+)"/);
        const userAddress = extractValue(block, /user-address=([\d.]+)/);
        const status = extractValue(block, /status=([\w,]+)/);
        const started = extractValue(block, /started=([\d-]+\s+[\d:]+)/);
        const uptime = extractValue(block, /uptime=([\w\d]+)/);
        const download = extractValue(block, /download=([\w\d.]+)/);
        const upload = extractValue(block, /upload=([\w\d.]+)/);
        const lastAccountingPacket = extractValue(block, /last-accounting-packet=([\d-]+\s+[\d:]+)/);

        activeSessions.push({
            userName,
            acctSessionId,
            nasPortType,
            nasPortId,
            nasIpAddress,
            callingStationId,
            userAddress,
            status,
            started: started ? new Date(started) : null,
            uptime,
            download,
            upload,
            lastAccountingPacket: lastAccountingPacket ? new Date(lastAccountingPacket) : null,
        });
    }

    return activeSessions;
}


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
                clientFullName: session['Client.clientFullName']
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

    async terminated(req, res) {
        const sessionId = req.params.id
        const session = await Session.findOne({ where: { acctSessionId: sessionId } })
        const user = await User.findByPk(session.userId);
        if (!user) res.status(404).json('user not founded')
        const profile = await Profile.findByPk(user.profileId);
        if (!profile) res.status(404).json('Profile not founded')
        const limitation = await Limitation.findByPk(profile.limitationId);
        if (!limitation) res.status(404).json('Limitation not founded')
        const router = await Router.findByPk(limitation.routerId);
        if (!router) res.status(404).json('Router not founded')
        const responsee = await executeCommand(router, `user-manager/session/close-session [find where acct-session-id=${sessionId}]`)
        // const response = await executeCommand(router, `user-manager/session/remove [find where acct-session-id=${sessionId}]`)
        res.status(200).json(responsee)
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

                const parsedSessions = parseSessionData(sessionResponse);

                for (const session of parsedSessions) {
                    if (!session.acctSessionId) continue

                    const { acctSessionId, started, ended, lastAccountingPacket, ...otherData } = session;

                    const existingSession = await Session.findOne({ where: { acctSessionId } });

                    if (!existingSession) {
                        await Session.create({
                            userId: user.id,
                            acctSessionId,
                            ...otherData,
                            started: started ? new Date(started) : null,
                            ended: ended ? new Date(ended) : null,
                            lastAccountingPacket: lastAccountingPacket ? new Date(lastAccountingPacket) : null,
                        });
                    } else {
                        const updatedFields = {};

                        for (const key in otherData) {
                            if (existingSession[key] !== otherData[key]) {
                                updatedFields[key] = otherData[key];
                            }
                        }

                        if (started && (!existingSession.started || existingSession.started.toISOString() !== new Date(started).toISOString())) {
                            updatedFields.started = new Date(started);
                        }
                        if (ended && (!existingSession.ended || existingSession.ended.toISOString() !== new Date(ended).toISOString())) {
                            updatedFields.ended = new Date(ended);
                        }
                        if (lastAccountingPacket && (!existingSession.lastAccountingPacket || existingSession.lastAccountingPacket.toISOString() !== new Date(lastAccountingPacket).toISOString())) {
                            updatedFields.lastAccountingPacket = new Date(lastAccountingPacket);
                        }

                        if (Object.keys(updatedFields).length > 0) {
                            await existingSession.update(updatedFields);
                        }
                    }
                }

             

                const activeCommand = `user-manager/session/print where active=yes user=${user.name}`;
                const activeResponse = await executeCommand(router, activeCommand);
                const parsedActiveSessions = parseActiveSessions(activeResponse);

                // 🟢 افزودن تمام سشن‌های فعال این کاربر به آرایه `activeUsers`
                for (const session of parsedActiveSessions) {
                    if (!session.acctSessionId)continue
                    activeUsers.push({
                        userName: user.name,
                        roomNumber: user.roomNumber,
                        acctSessionId: session.acctSessionId,
                        callingStationId: session.callingStationId,
                        userAddress: session.userAddress,
                        started: session.started,
                        uptime: session.uptime,
                        download: session.download,
                        upload: session.upload,
                        lastAccountingPacket: session.lastAccountingPacket,
                    });
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
