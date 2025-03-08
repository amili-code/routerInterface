const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../model/Admin');
const AdminActivityLog = require('../model/AdminActivityLog');



class adminController {
    async register(req, res) {
        try {
            const { name, password, phoneNumber, nationalCode } = req.body;

            // بررسی وجود ادمین با همان شماره تلفن یا کد ملی
            const existingAdmin = await Admin.findOne({
                where: { phoneNumber }
            });
            if (existingAdmin) {
                return res.status(400).json({ message: "این شماره تلفن قبلاً ثبت شده است." });
            }

            // ایجاد ادمین جدید
            const newAdmin = await Admin.create({ name, password, phoneNumber, nationalCode });
            res.status(201).json({ message: "ثبت‌نام با موفقیت انجام شد.", admin: newAdmin });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "خطا در ثبت‌نام." });
        }
    }

    async login(req, res) {
        try {
            const { nationalCode, password } = req.body;
            // بررسی وجود ادمین
            const admin = await Admin.findOne({ where: { nationalCode } });
            if (!admin) {
                return res.status(400).json({ message: "ادمین یافت نشد." });
            }

            // بررسی رمز عبور
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(400).json({ message: "رمز عبور اشتباه است." });
            }

            // تولید توکن JWT
            const token = jwt.sign({ id: admin.id, name: admin.name }, process.env.JWT_SECRET, { expiresIn: "1h" });
            req.session.token = token
            

            res.json({ message: "ورود موفقیت‌آمیز بود.", token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "خطا در ورود." });
        }
    }

    async logout(req, res) {
        req.session.token = ""
        res.redirect('/')
    }



    async getAll(req, res) {
        try {
            const all = await AdminActivityLog.findAll({
                attributes: ["action", "createdAt"], // انتخاب فقط این دو فیلد
                order: [["createdAt", "DESC"]] // مرتب‌سازی بر اساس جدیدترین داده‌ها
            });

            res.json(all);
        } catch (error) {
            res.status(500).json({ message: "خطا در دریافت اطلاعات", error });
        }
    }


}


module.exports = new adminController()