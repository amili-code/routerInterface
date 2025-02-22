const User = require("../model/Client");
const Profile = require("../model/Profile");
const Limitation = require("../model/Limitation");
const Router = require("../model/Routers");
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
