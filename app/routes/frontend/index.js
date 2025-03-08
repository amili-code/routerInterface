const express = require("express");
const router = express.Router();

const web = require("app/web");



router.get("/", web.root.bind(web));
router.get("/users", web.users.bind(web));
router.get("/mikrotik", web.mikrotik.bind(web));
router.get(`/${process.env.LOGIN_URL}`, web.login.bind(web));
router.get(`/about-us`, web.about.bind(web));
router.get(`/toturial`, web.toturial.bind(web));



module.exports = router;