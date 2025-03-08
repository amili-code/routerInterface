const Router = require('../model/Routers')
const { executeCommand } = require('../command/routerCommand');
const Profile = require('../model/Profile');
const Req = require('../model/Req');
const Client = require('../model/Client');
const axios = require("axios");


function generateRandomChars(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
}

async function sendSms(number, family , key) {
    
    try {
        let url = 'https://portal.amootsms.com/rest/SendSimple';
        url += '?Token=' + encodeURIComponent(`${process.env.AMOT_TOKEN}`);
        url += '&SendDateTime=2020-01-01 12:00:00';
        url += '&SMSMessageText=' + encodeURIComponent(`کاربر ${family} اطلاعات شما در سامانه هتل سلام با موفقیت ثبت شد .\n نام کاربری و رمز عبور:${key}`);
        url += '&LineNumber=service';
        url += `&Mobiles=${number}`;

        const response = await axios.get(url);
        console.log(response.data);
        return response.data; // خروجی پیامک را برمی‌گردانیم
    } catch (error) {
        console.error("خطا در ارسال پیامک:", error.message);
        throw new Error("خطا در ارسال پیامک");
    }
}
async function sendSms2(number, family) {
    console.log(number);
    try {
        let url = 'https://portal.amootsms.com/rest/SendSimple';
        url += '?Token=' + encodeURIComponent(`${process.env.AMOT_TOKEN}`);
        url += '&SendDateTime=2020-01-01 12:00:00';
        url += '&SMSMessageText=' + encodeURIComponent(`کاربر ${family} اطلاعات شما در سامانه هتل سلام تایید نشد.`);
        url += '&LineNumber=service';
        url += `&Mobiles=${number}`;

        const response = await axios.get(url);
        console.log(response.data);
        return response.data; // خروجی پیامک را برمی‌گردانیم
    } catch (error) {
        console.error("خطا در ارسال پیامک:", error.message);
        throw new Error("خطا در ارسال پیامک");
    }
}
async function cahs() {
    try {
        let url = `https://portal.amootsms.com/rest/AccountStatus?token=${process.env.AMOT_TOKEN}`
        const response = await axios.get(url);
        // console.log(response.data);
        return response.data.RemaindCredit; // خروجی پیامک را برمی‌گردانیم
    } catch (error) {
        console.error("خطا در ارسال پیامک:", error.message);
        throw new Error("خطا در ارسال پیامک");
    }
}

class reqController {
    async getAll(req, res) {
        try {


            const reqs = await Req.findAll({
                include: [
                    {
                        model: Profile,
                        attributes: ["name", "price"],
                    },
                ],
                attributes: { exclude: ["profileId"] },
            });

            const formattedReq = reqs.map(req => {
                const { Profile, ...rest } = req.toJSON(); // جدا کردن star

                return {
                    ...rest,
                    profileName: Profile ? Profile.name : null,
                    profilePrice: Profile ? Profile.price : null,
                };
            });

            res.status(200).json(formattedReq);
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

    async confirm(req, res) {
        try {
            const id = req.params.id;
            const request = await Req.findByPk(id);
            if (!request) {
                return res.status(404).json({ error: "درخواست مورد نظر پیدا نشد" });
            }

            // 1. ابتدا پیامک ارسال شود
            await sendSms(request.phone, request.family, request.password);

            // 2. سپس درخواست را به API ارسال کنیم
            const response = await axios.post("http://localhost:5000/api/client", {
                name: request.userName,
                username: request.name,
                password: request.password,
                fullName: request.family,
                roomNumber: request.room,
                profileId: request.profileId,
                ClientCount: request.count,
            });

            // 3. اگر همه مراحل موفقیت‌آمیز بود، درخواست از دیتابیس حذف شود
            await request.destroy();

            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async doshbourdApi(req, res) {
        const RemaindCredit = await cahs()
        
        res.json({cash:RemaindCredit})
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
            const id = req.params.id
            const reqe = await Req.findByPk(id)
            await sendSms2(request.phone, request.family);
            await reqe.destroy();
            res.status(200).json({});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}


module.exports = new reqController()