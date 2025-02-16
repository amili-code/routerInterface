const express = require("express");
const router = express.Router();

const web = require("app/web");



router.get("/", web.root.bind(web));
router.get("/routers", web.root.bind(web));

module.exports = router;