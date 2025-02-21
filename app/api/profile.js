const Limitation = require("../model/Limitation");
const Profile = require("../model/Profile");
const Router = require("../model/Routers");
const { executeCommand } = require('../command/routerCommand');


class ProfileController {
    async getAll(req, res) {
        try {
            const profiles = await Profile.findAll({
                include: [
                    {
                        model: Limitation,
                        attributes: ["name"],
                    },
                ],
                attributes: { exclude: ["limitationId"] },
            });

            const formattedProfiles = profiles.map(profile => {
                const { Limitation, startDate, ...rest } = profile.toJSON();
                return {
                    ...rest,
                    startDate: startDate === "first_use" ? "از اولین بار" : "از موقع ورود",
                    limitationName: Limitation ? Limitation.name : null
                };
            });

            res.status(200).json(formattedProfiles);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const { name, price, startDate, weekDays, limitationId } = req.body;
            const limitation = await Limitation.findByPk(limitationId, { include: Router });
            if (!limitation) return res.status(404).json({ error: "محدودیت پیدا نشد" });

            const router = limitation.Router;
            if (!router) return res.status(404).json({ error: "روتر مرتبط پیدا نشد" });

            let starts = ""

            if (startDate != "first_use") {
                starts = "first-auth"
            } else {
                starts = "assigned"
            }

            // اجرای دستور افزودن پروفایل روی روتر
            const relatedCommand = `user-manager/profile-limitation/add profile=${name} limitation=${limitation.name} weekdays=saturday,sunday,monday,tuesday,wednesday,thursday,friday`
            const fCommand = `user-manager/profile/add name=${name} price=${price} starts-when=${starts} validity=unlimited`

            console.log(relatedCommand);
            console.log(fCommand);

            const response = await executeCommand(router, fCommand);
            const relatedResponse = await executeCommand(router, relatedCommand);
            // if (!response) throw new Error("خطا در افزودن پروفایل روی روتر");

            const profile = await Profile.create(req.body);
            // ذخیره در دیتابیس بعد از موفقیت در روتر
            res.status(200).json(profile);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const profile = await Profile.findByPk(req.params.id, { include: Limitation });
            if (!profile) return res.status(404).json({ error: "پروفایل پیدا نشد" });
            res.status(200).json(profile);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const profile = await Profile.findByPk(req.params.id, { include: Limitation });
            if (!profile) return res.status(404).json({ error: "پروفایل پیدا نشد" });

            const { name, price, startDate, weekDays, limitationId } = req.body;
            const limitation = await Limitation.findByPk(limitationId, { include: Router });
            if (!limitation) return res.status(404).json({ error: "محدودیت پیدا نشد" });

            const router = limitation.Router;
            if (!router) return res.status(404).json({ error: "روتر مرتبط پیدا نشد" });
            let starts = ""

            if (startDate != "first_use") {
                starts = "first-auth"
            } else {
                starts = "assigned"
            }

            if (profile.limitationId != limitationId) {
                const relatedCommand = `user-manager/profile-limitation/remove [find profile=${profile.name}]`
                const deleteCommand = await executeCommand(router, relatedCommand) 
                const createCommand = `user-manager/profile-limitation/add profile=${name} limitation=${limitation.name} weekdays=saturday,sunday,monday,tuesday,wednesday,thursday,friday`
                const confirmCommand = await executeCommand(router, createCommand) 
                console.log(deleteCommand);
                console.log(confirmCommand);
            }
            
            // اجرای دستور برای ویرایش پروفایل روی روتر
            const command = `user-manager/profile/set [find name="${profile.name}"] name=${name} price=${price} starts-when=${starts} validity=unlimited`;
            const response = await executeCommand(router, command);
            
            // بروزرسانی دیتابیس در صورت موفقیت
            await profile.update(req.body);
            res.status(200).json(profile);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const profile = await Profile.findByPk(req.params.id, { include: Limitation });
            if (!profile) return res.status(404).json({ error: "پروفایل پیدا نشد" });

            const limitation = await Limitation.findByPk(profile.limitationId, { include: Router });
            if (!limitation) return res.status(404).json({ error: "محدودیت پیدا نشد" });

            const router = limitation.Router;
            if (!router) return res.status(404).json({ error: "روتر مرتبط پیدا نشد" });

            // حذف پروفایل از روتر
            const command = `user-manager/profile/remove [find name="${profile.name}"]`;
            const relatedCommand = `user-manager/profile-limitation/remove [find profile=${profile.name}]`;
           
            const relatedResponse = await executeCommand(router, relatedCommand);
            const response = await executeCommand(router, command);
            console.log(command , relatedCommand);
            // حذف از دیتابیس در صورت موفقیت
            await profile.destroy();
            res.status(200).json({ message: "پروفایل حذف شد" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ProfileController();

