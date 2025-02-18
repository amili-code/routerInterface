const Limitation = require("../model/Limitation");
const Profile = require("../model/Profile");


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
            const profile = await Profile.create(req.body);
            res.status(201).json(profile);
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
            const profile = await Profile.findByPk(req.params.id);
            if (!profile) return res.status(404).json({ error: "پروفایل پیدا نشد" });

            await profile.update(req.body);
            res.status(200).json(profile);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const profile = await Profile.findByPk(req.params.id);
            if (!profile) return res.status(404).json({ error: "پروفایل پیدا نشد" });

            await profile.destroy();
            res.status(200).json({ message: "پروفایل حذف شد" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ProfileController();

