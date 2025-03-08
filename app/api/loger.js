const Client = require('../model/Client');
const Session = require("../model/Session");
const { Op, fn, col, literal } = require('sequelize');
const moment = require("moment-jalaali");
moment.loadPersian({ usePersianDigits: false });
const jalaali = require("jalaali-js")

// تابع برای تبدیل `uptime` از فرمت `4m16s` به ثانیه
function convertUptimeToSeconds(uptime) {
    let totalSeconds = 0;
    const match = uptime.match(/(\d+)m/g); // استخراج دقیقه
    if (match) {
        totalSeconds += parseInt(match[0]) * 60; // تبدیل به ثانیه
    }
    const secondsMatch = uptime.match(/(\d+)s/g); // استخراج ثانیه
    if (secondsMatch) {
        totalSeconds += parseInt(secondsMatch[0]);
    }
    return totalSeconds;
}

// تابع برای تبدیل `ثانیه` به فرمت `XmYs`
function convertSecondsToUptime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m${remainingSeconds}s`;
}

function convertShamsiToMiladi(shamsiDate) {
    return moment(shamsiDate, "jYYYY-jMM-jDD").format("YYYY-MM-DD");
}

function convertMiladiToShamsi(miladiDate) {
    return moment(miladiDate, "YYYY-MM-DD").format("jYYYY-jMM-jDD");
}


class logerController {
    async main(req, res) {
        const { name } = req.params;

        const sessions = await Session.findAll({
            where: { userName: name }
        });

        let yearData = new Map();

        for (const session of sessions) {
            const date = new Date(session.started);
            const { jy: year } = jalaali.toJalaali(date); // تبدیل سال میلادی به شمسی

            // تبدیل مقدار عددی از رشته (مثلاً "1122" یا "5.7KiB")
            const download = parseFloat(session.download) || 0;
            const upload = parseFloat(session.upload) || 0;
            const uptimeInSeconds = convertUptimeToSeconds(session.uptime);

            // اگر سال قبلاً اضافه نشده بود، مقدار اولیه را تنظیم کن
            if (!yearData.has(year)) {
                yearData.set(year, { year, download: 0, upload: 0, uptimeInSeconds: 0 });
            }

            // مقدار جدید را به مقدار قبلی اضافه کن
            let data = yearData.get(year);
            data.download += download;
            data.upload += upload;
            data.uptimeInSeconds += uptimeInSeconds;
            yearData.set(year, data);
        }

        // تبدیل `uptimeInSeconds` به فرمت `XmYs` و ارسال خروجی
        const result = Array.from(yearData.values()).map(item => ({
            year: item.year, // سال شمسی
            download: item.download,
            upload: item.upload,
            uptime: convertSecondsToUptime(item.uptimeInSeconds)
        }));

        res.json(result);
    }



    async  year(req, res) {
        const { name, year } = req.params;

        // تبدیل `year` به عدد صحیح
        const yearInt = parseInt(year, 10);

        // بررسی مقدار `yearInt` (نباید `NaN` باشد)
        if (isNaN(yearInt)) {
            return res.status(400).json({ error: "سال معتبر وارد کنید" });
        }

        // تبدیل سال 1402 شمسی به میلادی
        const startJalali = jalaali.toGregorian(yearInt, 1, 1);
        const endJalali = jalaali.toGregorian(yearInt, 12, 29); // اسفند 29 در سال‌های غیر کبیسه

        // بررسی اعتبار تاریخ‌های تبدیل شده
        if (!startJalali || !endJalali) {
            return res.status(500).json({ error: "مشکل در تبدیل تاریخ شمسی به میلادی" });
        }

        // تبدیل تاریخ میلادی به فرمت `YYYY-MM-DD` برای SQL
        const startDate = `${startJalali.gy}-${String(startJalali.gm).padStart(2, "0")}-${String(startJalali.gd).padStart(2, "0")} 00:00:00`;
        const endDate = `${endJalali.gy}-${String(endJalali.gm).padStart(2, "0")}-${String(endJalali.gd).padStart(2, "0")} 23:59:59`;

       

        // دریافت داده‌ها از دیتابیس
        const sessions = await Session.findAll({
            where: {
                userName: name,
                started: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        // مقداردهی اولیه به کل 12 ماه شمسی
        let monthData = new Map();
        for (let i = 1; i <= 12; i++) {
            monthData.set(i, { month: i, download: 0, upload: 0, uptimeInSeconds: 0 });
        }

        // پردازش داده‌های دریافتی از دیتابیس
        for (const session of sessions) {
            const date = new Date(session.started);
            const { jm: month } = jalaali.toJalaali(date); // دریافت شماره ماه شمسی

            const download = parseFloat(session.download) || 0;
            const upload = parseFloat(session.upload) || 0;
            const uptimeInSeconds = convertUptimeToSeconds(session.uptime);

            let data = monthData.get(month);
            data.download += download;
            data.upload += upload;
            data.uptimeInSeconds += uptimeInSeconds;
            monthData.set(month, data);
        }

        // تبدیل خروجی به فرمت نهایی
        const result = Array.from(monthData.values()).map(item => ({
            month: item.month,
            download: item.download,
            upload: item.upload,
            uptime: convertSecondsToUptime(item.uptimeInSeconds)
        }));

        res.json(result);
    }




    async month(req, res) {
        const { name, year, month } = req.params;

        // تبدیل `year` و `month` به عدد
        const yearInt = parseInt(year, 10);
        const monthInt = parseInt(month, 10);

        // بررسی اعتبار ورودی
        if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
            return res.status(400).json({ error: "سال یا ماه نامعتبر است" });
        }

        // **تبدیل تاریخ شمسی به میلادی برای اولین و آخرین روز ماه**
        const startJalali = jalaali.toGregorian(yearInt, monthInt, 1);
        const daysInMonth = jalaali.jalaaliMonthLength(yearInt, monthInt);
        const endJalali = jalaali.toGregorian(yearInt, monthInt, daysInMonth);

        // بررسی مقدار تاریخ‌های تبدیل‌شده
        if (!startJalali || !endJalali) {
            return res.status(500).json({ error: "خطا در تبدیل تاریخ شمسی به میلادی" });
        }

        // فرمت `YYYY-MM-DD HH:MM:SS` برای کوئری دیتابیس
        const startDate = `${startJalali.gy}-${String(startJalali.gm).padStart(2, "0")}-${String(startJalali.gd).padStart(2, "0")} 00:00:00`;
        const endDate = `${endJalali.gy}-${String(endJalali.gm).padStart(2, "0")}-${String(endJalali.gd).padStart(2, "0")} 23:59:59`;

   

        // دریافت داده‌های مربوط به ماه شمسی از دیتابیس
        const sessions = await Session.findAll({
            where: {
                userName: name,
                started: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        // مقداردهی اولیه به کل روزهای ماه (حتی اگر داده‌ای نداشته باشند)
        let dayData = new Map();
        for (let i = 1; i <= daysInMonth; i++) {
            dayData.set(i, { day: i, download: 0, upload: 0, uptimeInSeconds: 0 });
        }

        // پردازش جلسات و جمع زدن داده‌ها
        for (const session of sessions) {
            const date = new Date(session.started);
            const { jd: day } = jalaali.toJalaali(date); // استخراج روز شمسی

            const download = parseFloat(session.download) || 0;
            const upload = parseFloat(session.upload) || 0;
            const uptimeInSeconds = convertUptimeToSeconds(session.uptime);

            let data = dayData.get(day);
            data.download += download;
            data.upload += upload;
            data.uptimeInSeconds += uptimeInSeconds;
            dayData.set(day, data);
        }

        // تبدیل `uptimeInSeconds` به فرمت `XhYmZs`
        const result = Array.from(dayData.values()).map(item => ({
            day: item.day,
            download: item.download,
            upload: item.upload,
            uptime: convertSecondsToUptime(item.uptimeInSeconds)
        }));

        res.json(result);
    }



    async day(req, res) {
        const { name, year, month, day } = req.params;

        // تبدیل `year`، `month` و `day` به عدد
        const yearInt = parseInt(year, 10);
        const monthInt = parseInt(month, 10);
        const dayInt = parseInt(day, 10);

        // بررسی اعتبار ورودی
        if (isNaN(yearInt) || isNaN(monthInt) || isNaN(dayInt) || monthInt < 1 || monthInt > 12 || dayInt < 1 || dayInt > 31) {
            return res.status(400).json({ error: "سال، ماه یا روز نامعتبر است" });
        }

        // **تبدیل تاریخ شمسی به میلادی**
        const gregorianDate = jalaali.toGregorian(yearInt, monthInt, dayInt);
        if (!gregorianDate) {
            return res.status(500).json({ error: "خطا در تبدیل تاریخ شمسی به میلادی" });
        }

        // فرمت `YYYY-MM-DD HH:MM:SS` برای کوئری دیتابیس
        const startDate = `${gregorianDate.gy}-${String(gregorianDate.gm).padStart(2, "0")}-${String(gregorianDate.gd).padStart(2, "0")} 00:00:00`;
        const endDate = `${gregorianDate.gy}-${String(gregorianDate.gm).padStart(2, "0")}-${String(gregorianDate.gd).padStart(2, "0")} 23:59:59`;

        
        // دریافت داده‌های مربوط به روز مشخص شده از دیتابیس
        const sessions = await Session.findAll({
            where: {
                userName: name,
                started: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        // مقداردهی اولیه به تمام 24 ساعت (حتی اگر داده نداشته باشند)
        let hourData = new Map();
        for (let i = 0; i < 24; i++) {
            hourData.set(i, { hour: i, download: 0, upload: 0, uptimeInSeconds: 0, active: false });
        }

        // پردازش جلسات و جمع زدن داده‌ها
        for (const session of sessions) {
            const date = new Date(session.started);
            const hour = date.getHours(); // استخراج ساعت (0 تا 23)

            const download = parseFloat(session.download) || 0;
            const upload = parseFloat(session.upload) || 0;
            const uptimeInSeconds = convertUptimeToSeconds(session.uptime);

            let data = hourData.get(hour);
            data.uptimeInSeconds += uptimeInSeconds;
            data.active = true; // نشان می‌دهد که کاربر در این ساعت آنلاین بوده
            hourData.set(hour, data);
        }

        // تعداد ساعت‌هایی که کاربر آنلاین بوده را محاسبه کن
        let activeHours = [...hourData.values()].filter(item => item.active).length;

        // اگر حداقل یک ساعت فعال وجود دارد، دانلود و آپلود را بین آن‌ها تقسیم کن
        if (activeHours > 0) {
            let totalDownload = sessions.reduce((sum, session) => sum + (parseFloat(session.download) || 0), 0);
            let totalUpload = sessions.reduce((sum, session) => sum + (parseFloat(session.upload) || 0), 0);

            let perHourDownload = totalDownload / activeHours;
            let perHourUpload = totalUpload / activeHours;

            // مقدار دانلود و آپلود را فقط بین ساعت‌های فعال تقسیم کن
            hourData.forEach((data) => {
                if (data.active) {
                    data.download = perHourDownload;
                    data.upload = perHourUpload;
                }
            });
        }

        // تبدیل `uptimeInSeconds` به فرمت `XhYmZs`
        const result = Array.from(hourData.values()).map(item => ({
            hour: item.hour,
            download: item.download,
            upload: item.upload,
            uptime: convertSecondsToUptime(item.uptimeInSeconds)
        }));

        res.json(result);
    }


    

}


module.exports = new logerController()