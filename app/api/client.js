const User = require("../model/Client");
const Profile = require("../model/Profile");
const Limitation = require("../model/Limitation");
const Router = require("../model/Routers");
const Session = require("../model/Session");
const { executeCommand } = require("../command/routerCommand");
const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/database');


function parseSessionData(sessionResponse) {
    const extractValue = (text, pattern) => {
        const match = text.match(pattern);
        return match ? match[1] : null;
    };

    // 🔥 بهبود روش جدا کردن سشن‌ها
    const sessionBlocks = sessionResponse.split(/\n\s*\d+\s+A?\s+user=/g)
        .filter(block => block.trim() && /acct-session-id=/.test(block));
    const sessions = [];

    for (const block of sessionBlocks) {
        const acctSessionId = extractValue(block, /acct-session-id="(\d+)"/);
        const nasPortType = extractValue(block, /nas-port-type=(\S+)/);
        const nasPortId = extractValue(block, /nas-port-id="(\S+)"/);
        const nasIpAddress = extractValue(block, /nas-ip-address=(\S+)/);
        const callingStationId = extractValue(block, /calling-station-id="([\w:]+)"/);
        const userAddress = extractValue(block, /user-address=(\S+)/);
        const status = extractValue(block, /status=([\w,-]+)/);
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
        const acctSessionId = extractValue(block, /acct-session-id="?(\d+)"?/);
        const nasPortType = extractValue(block, /nas-port-type=(\S+)/);
        const nasPortId = extractValue(block, /nas-port-id="(\S+)"/);
        const nasIpAddress = extractValue(block, /nas-ip-address=([\d.]+)/);
        const callingStationId = extractValue(block, /calling-station-id="([\w:]+)"/);
        const userAddress = extractValue(block, /user-address=([\d.]+)/);
        const status = extractValue(block, /status=([\w,-]+)/);
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

const parseSessionDatae = (rawData) => {
    const sessions = [];
    const lines = rawData.split('\n');

    let session = {};
    lines.forEach((line) => {
        line = line.trim();
        if (!line) return; // اگر خط خالی است، رد کن

        const userMatch = line.match(/^(\d+\s+A?\s*)?user=(\S+)/);
        if (userMatch) {
            if (session.user) {
                sessions.push(session); // سشن قبلی رو ذخیره کن
            }
            session = { user: userMatch[2] };
        }

        const fieldMapping = {
            acctSessionId: /acct-session-id="([^"]+)"/,
            nasPortType: /nas-port-type=(\S+)/,
            nasPortId: /nas-port-id="([^"]+)"/,
            nasIpAddress: /nas-ip-address=([\d.]+)/,
            callingStationId: /calling-station-id="([^"]+)"/,
            userAddress: /user-address=([\d.]+)/,
            status: /status=([\w,]+)/,
            started: /started=([\d-]+\s+[\d:]+)/,
            ended: /ended=([\d-]+\s+[\d:]+)/,
            terminateCause: /terminate-cause=([\w-]+)/,
            uptime: /uptime=([\w\d]+)/,
            download: /download=([\w\d.]+[KM]?i?B?)/,
            upload: /upload=([\w\d.]+[KM]?i?B?)/,
            lastAccountingPacket: /last-accounting-packet=([\d-]+\s+[\d:]+)/,
        };

        Object.keys(fieldMapping).forEach((key) => {
            const match = line.match(fieldMapping[key]);
            if (match) {
                session[key] = match[1];
            }
        });
    });

    if (session.user) {
        sessions.push(session); // آخرین سشن رو هم ذخیره کن
    }

    return sessions;
};

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
                const { Profile, star, ...rest } = user.toJSON(); // جدا کردن star

                return {
                    ...rest,
                    profileName: Profile ? Profile.name : null,
                    star // اضافه کردن star در انتها
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
                    'userName',
                    'callingStationId',
                    'userAddress',
                    'started',
                    'uptime',
                    'download',
                    'upload',
                    'lastAccountingPacket'
                ],
                order: [['createdAt', 'DESC']],
                raw: true
            });

            res.status(200).json(sessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            res.status(500).json({ message: 'Error fetching sessions' });
        }
    }

    async starClient(req, res) {
        try {
            const id = req.params.id;
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({ error: "کاربر پیدا نشد" });
            }

            // تغییر مقدار `star` به مقدار مخالف آن
            const newStarValue = !user.star;

            // آپدیت مقدار در دیتابیس
            await user.update({ star: newStarValue });

            res.status(200).json({ message: "وضعیت ستاره تغییر کرد", star: newStarValue });
        } catch (error) {
            res.status(500).json({ error: error.message });
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
                    'userName',
                    'callingStationId',
                    'userAddress',
                    'acctSessionId',
                    'started',
                    'uptime',
                    'download',
                    'upload',
                    'lastAccountingPacket'
                ],
                where: whereClause, // اعمال فیلتر داینامیک
                order: [['createdAt', 'DESC']],
                raw: true
            });





            res.status(200).json(sessions);
        } catch (error) {
            console.error('Error fetching filtered sessions:', error);
            res.status(500).json({ message: 'Error fetching filtered sessions' });
        }
    }

    async terminated(req, res) {
        // try {
        const sessionId = req.params.id
        console.log(sessionId);
        const session = await Session.findOne({ where: { acctSessionId: sessionId } })
        if (!session) res.status(404).json('session not founded')
        const user = await User.findOne({ where: { name: session.userName } });
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
        // } catch (error) {
        //     res.status(500).json(error)
        // }
    }

    async mostUsed(req, res) {
        // دیتابیس OUI برای پیدا کردن شرکت سازنده بر اساس مک آدرس
        const OUI_DATABASE = {
            "00:1A:2B": "Apple Inc.",
            "00:50:56": "VMware, Inc.",
            "3C:5A:B4": "Google, Inc.",
            "FC:A1:3E": "Samsung Electronics",
            "18:AF:61": "Huawei Technologies Co.",
            "40:B0:34": "Xiaomi Communications Co.",
            "B4:AE:2B": "ASUS",
            "00:15:5D": "Microsoft Corporation"
        };

        // تابع استخراج OUI از MAC Address
        const getManufacturer = (macAddress) => {
            if (!macAddress) return "Unknown";
            const oui = macAddress.substring(0, 8).toUpperCase(); // گرفتن ۳ بخش اول مک
            return OUI_DATABASE[oui] || "Unknown";
        };

        try {
            const { startDate, endDate, limit } = req.query;

            if (!startDate || !endDate || !limit) {
                return res.status(400).json({ error: 'startDate, endDate, and limit are required' });
            }

            const topUsers = await Session.findAll({
                attributes: [
                    'callingStationId',
                    'userAddress',  // چون در دیتابیس `nasIpAddress` نداریم
                    [sequelize.fn('SUM', sequelize.col('download')), 'totalDownload'],
                    [sequelize.fn('SUM', sequelize.col('upload')), 'totalUpload'],
                    [sequelize.fn('SUM', sequelize.literal('download + upload')), 'totalUsage']
                ],
                where: {
                    started: { [Op.gte]: new Date(startDate) },
                    ended: { [Op.lte]: new Date(endDate) }
                },
                group: ['callingStationId', 'userAddress'],  // گروه‌بندی بر اساس MAC و IP
                order: [[sequelize.literal('totalUsage'), 'DESC']],
                limit: parseInt(limit), // محدود کردن خروجی
                raw: true
            });

            // تبدیل خروجی و اضافه کردن `modifier`
            const formattedUsers = topUsers.map(user => ({
                callingStationId: user.callingStationId,
                userAddress: user.userAddress,
                totalDownload: user.totalDownload,
                totalUpload: user.totalUpload,
                totalUsage: user.totalUsage,
                modifier: getManufacturer(user.callingStationId) // استخراج شرکت سازنده
            }));

            res.json(formattedUsers);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async dangeresMac(req, res) {
        const OUI_DATABASE = {
            "00:1A:2B": "Apple Inc.",
            "00:50:56": "VMware, Inc.",
            "3C:5A:B4": "Google, Inc.",
            "FC:A1:3E": "Samsung Electronics",
            "18:AF:61": "Huawei Technologies Co.",
            "40:B0:34": "Xiaomi Communications Co.",
            "B4:AE:2B": "ASUS",
            "00:15:5D": "Microsoft Corporation"
        };

        // تابع استخراج OUI از MAC Address
        const getManufacturer = (macAddress) => {
            if (!macAddress) return "Unknown";
            const oui = macAddress.substring(0, 8).toUpperCase(); // گرفتن ۳ بخش اول مک
            return OUI_DATABASE[oui] || "Unknown";
        };

        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({ error: 'startDate and endDate are required' });
            }

            // دریافت تمام سشن‌های داخل بازه زمانی
            const sessions = await Session.findAll({
                attributes: ['callingStationId', 'userName'],
                where: {
                    started: { [Op.gte]: new Date(startDate) },
                    ended: { [Op.lte]: new Date(endDate) }
                },
                raw: true
            });


            // دسته‌بندی داده‌ها بر اساس MAC Address
            const macClients = {};
            for (const { callingStationId, userName } of sessions) {
                if (!macClients[callingStationId]) {
                    macClients[callingStationId] = { clients: new Set(), vendor: null };
                }
                macClients[callingStationId].clients.add(userName);
            }

            // دریافت نام شرکت برای هر MAC Address
            const macEntries = Object.entries(macClients);
            await Promise.all(macEntries.map(async ([mac, data]) => {
                data.vendor = await getManufacturer(mac);
            }));

            // فیلتر کردن MAC Addressهایی که بیشتر از یک کلاینت دارند
            const result = macEntries
                .filter(([_, data]) => data.clients.size > 1)
                .map(([mac, data]) => ({
                    callingStationId: mac,
                    uniqueClients: Array.from(data.clients),
                    totalClients: data.clients.size,
                    modifier: data.vendor
                }))
                .sort((a, b) => b.totalClients - a.totalClients);

            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async activeUser(req, res) {
        try {
            const routers = await Router.findAll();
            let activeUsers = [];

            for (const router of routers) {
                const check = await executeCommand(router, `ip address/print`);
                if (!check) continue;

                const response = await executeCommand(router, `user-manager/session/print where active=yes`);
                const sessions = parseSessionDatae(response);

                console.log(`تعداد کاربران فعال دریافت‌شده از روتر ${router.name}: ${sessions.length}`);

                const filteredSessions = sessions.map(session => ({
                    userName: session.user, // استفاده از userName به جای userId
                    acctSessionId: session.acctSessionId,
                    callingStationId: session.callingStationId,
                    nasIpAddress: session.nasIpAddress,
                    uptime: session.uptime,
                    download: session.download,
                    upload: session.upload,
                }));

                activeUsers = [...activeUsers, ...filteredSessions];
            }

            res.json(activeUsers);
        } catch (error) {
            console.error("خطا در دریافت کاربران فعال:", error);
            res.status(500).json({ message: "خطا در پردازش اطلاعات" });
        }
    }

    async updataSession(req, res) {
        try {
            const routers = await Router.findAll();

            for (const router of routers) {
                const check = await executeCommand(router, `ip address/print`);
                if (!check) continue;

                const response = await executeCommand(router, `user-manager/session/print`);
                const sessions = parseSessionDatae(response);
                console.log(`تعداد سشن‌های دریافت‌شده: ${sessions.length}`);

                const newSessions = [];

                for (const session of sessions) {
                    if (!session.user) continue;
                    if (!session.acctSessionId) {
                        console.warn(`سشن بدون شناسه: ${session}`);
                        continue;
                    }

                    const existingSession = await Session.findOne({
                        where: { acctSessionId: session.acctSessionId, userName: session.user },
                    });

                    if (existingSession) {
                        await existingSession.update({
                            ...session,
                            userName: session.user, // ذخیره نام کاربر به جای userId
                        });
                    } else {
                        newSessions.push({
                            ...session,
                            userName: session.user,
                        });
                    }
                }

                if (newSessions.length > 0) {
                    await Session.bulkCreate(newSessions);
                    console.log(`${newSessions.length} سشن جدید اضافه شد.`);
                }
            }

            res.json({ message: "بروزرسانی انجام شد" });
        } catch (error) {
            console.error("خطا در پردازش سشن‌ها:", error);
            res.status(500).json({ message: "خطا در پردازش اطلاعات" });
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

            if (user.name != name) {
                const sessions = await Session.findAll({ where: { userName: user.name } })
                for (const session of sessions) {
                    const newUserName = name;
                    await session.update({ userName: newUserName })
                }
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


   async  loger(req, res) {
    try {
        const { userName, year, month, day } = req.query;
        if (!userName) return res.status(400).json({ error: 'userName is required' });

        // دریافت تمام سشن‌های کاربر
        const sessions = await Session.findAll({
            where: { userName },
            raw: true
        });

        if (!sessions.length) return res.json({ message: 'No data found' });

        let groupedData = {};

        sessions.forEach(session => {
            const sessionDate = new Date(session.started);
            const sessionYear = sessionDate.getFullYear();
            const sessionMonth = sessionDate.getMonth() + 1;
            const sessionDay = sessionDate.getDate();
            const sessionHour = sessionDate.getHours();
            const sessionMinute = sessionDate.getMinutes();

            if (!groupedData[sessionYear]) {
                groupedData[sessionYear] = { uptime: 0, download: 0, upload: 0 };
            }
            if (year && sessionYear != year) return;

            groupedData[sessionYear].uptime += session.uptime;
            groupedData[sessionYear].download += session.download;
            groupedData[sessionYear].upload += session.upload;

            if (month) {
                if (!groupedData[sessionYear][sessionMonth]) {
                    groupedData[sessionYear][sessionMonth] = { uptime: 0, download: 0, upload: 0 };
                }
                if (sessionMonth != month) return;
                groupedData[sessionYear][sessionMonth].uptime += session.uptime;
                groupedData[sessionYear][sessionMonth].download += session.download;
                groupedData[sessionYear][sessionMonth].upload += session.upload;
            }

            if (day) {
                if (!groupedData[sessionYear][sessionMonth][sessionDay]) {
                    groupedData[sessionYear][sessionMonth][sessionDay] = {};
                }
                if (sessionDay != day) return;
                const timeKey = `${String(sessionHour).padStart(2, '0')}:${String(sessionMinute).padStart(2, '0')}`;
                groupedData[sessionYear][sessionMonth][sessionDay][timeKey] = {
                    uptime: session.uptime,
                    download: session.download,
                    upload: session.upload
                };
            }
        });

        if (year && !month && !day) {
            return res.json(groupedData[year]);
        } else if (year && month && !day) {
            let monthlyData = {};
            for (let i = 1; i <= 12; i++) {
                monthlyData[i] = groupedData[year]?.[i] || { uptime: 0, download: 0, upload: 0 };
            }
            return res.json(monthlyData);
        } else if (year && month && day) {
            let dailyData = {};
            for (let i = 1; i <= 31; i++) {
                dailyData[i] = groupedData[year]?.[month]?.[i] || { uptime: 0, download: 0, upload: 0 };
            }
            return res.json(dailyData);
        }

        res.json(groupedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    }



    
}

module.exports = new ClientController();
