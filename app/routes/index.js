const express = require("express");
const router = express.Router();

const backEnd = require("app/routes/backend");
const front = require("app/routes/frontend");


router.use("/", front);
router.use("/api", backEnd);
router.use((req, res) => {
    res.status(404).render("404", { host: `${process.env.HOST}:${process.env.PORT}/users` });

});
module.exports = router;
