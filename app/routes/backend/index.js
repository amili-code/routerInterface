const express = require("express");
const router = express.Router();
const videoUpload = require('../../middlewares/videoUpload')
const picUpload = require('../../middlewares/picUpload')
const configUpload = require('../../middlewares/configUpload')
const activityLogger = require("../../middlewares/userLogger")
const adminLogger = require("../../middlewares/adminLogger")
const logMiddleware = require("../../middlewares/logMiddleware")


const routerController = require("app/api/routers");
const limitationController = require("app/api/limitation");
const profileController = require("app/api/profile");
const clientController = require("app/api/client");
const blockedClientController = require("app/api/blockedClient");
const reqController = require("app/api/req");
const logerController = require("app/api/loger");
const adminController = require("app/api/admin");







router.get('/admin-log', logMiddleware(null), adminController.getAll.bind(adminController))
router.get('/logout', logMiddleware(`از حساب خود خارج شد`), adminController.logout.bind(adminController))
router.post('/register', adminController.register.bind(adminController))
router.post('/login', adminController.login.bind(adminController))


router.get('/loger/:name', logMiddleware(null), logerController.main.bind(logerController))
router.get('/loger/:name/:year', logMiddleware(null), logerController.year.bind(logerController))
router.get('/loger/:name/:year/:month', logMiddleware(null), logerController.month.bind(logerController))
router.get('/loger/:name/:year/:month/:day', logMiddleware(null), logerController.day.bind(logerController))


router.get('/req', logMiddleware(null),reqController.getAll.bind(reqController))
router.get('/dash', logMiddleware(null), reqController.doshbourdApi.bind(reqController))
router.get('/rem/:id', logMiddleware(`یک درخواست بسته رو حذف کرد`), reqController.delete.bind(reqController))
router.post('/req', reqController.create.bind(reqController))
router.get('/confirm/:id', logMiddleware(`یک درخواست بسته رو تایید کرد`), reqController.confirm.bind(reqController))

// router.use(activityLogger);
router.get('/routers', logMiddleware(null), routerController.getAll.bind(routerController))
router.get('/router-information/:id&:ether', logMiddleware(null), routerController.information.bind(routerController))
router.post('/routers', logMiddleware(`یک روتر اضافه کرد`), routerController.create.bind(routerController))
router.get('/routers/:id', logMiddleware(null), routerController.getOne.bind(routerController))
router.get('/routers-connection/:id', logMiddleware(null), routerController.connection.bind(routerController))
router.put('/routers/:id', logMiddleware(`اطلاعات یک روتر رو تغییر داد`), routerController.update.bind(routerController))
router.delete('/routers/:id', logMiddleware(`یک روتر رو از نرم افزار حذف کرد`), routerController.delete.bind(routerController))

router.get('/limitation', limitationController.getAll.bind(limitationController))
router.get('/limitation-router', logMiddleware(null), limitationController.getAllRouter.bind(limitationController))
router.post('/limitation', logMiddleware(`یک محدودیت اضافه کرد`), limitationController.create.bind(limitationController))
router.get('/limitation/:id', logMiddleware(null), limitationController.getOne.bind(limitationController))
router.put('/limitation/:id', logMiddleware(`یک محودیت رو تغییر داد`), limitationController.update.bind(limitationController))
router.delete('/limitation/:id', logMiddleware(`یک محدودیت رو حذف کرد`), limitationController.delete.bind(limitationController))

router.get('/profile', profileController.getAll.bind(profileController))
router.post('/profile', logMiddleware(`یک پروفایل ایجاد کرد`), profileController.create.bind(profileController))
router.get('/profile/:id', logMiddleware(null), profileController.getOne.bind(profileController))
router.put('/profile/:id', logMiddleware(`یک پروفایل رو تغییر داد`), profileController.update.bind(profileController))
router.delete('/profile/:id', logMiddleware(`یک پروفایل رو حذف کرد`), profileController.delete.bind(profileController))

router.get('/client', logMiddleware(null), clientController.getAll.bind(clientController))
router.get('/client-stars/:id', logMiddleware(`کاربران ستاره دار را تغییر داد`), clientController.starClient.bind(clientController))
router.get('/activite-terminate/:id', logMiddleware(`اتصال کاربر به اینترنت را قطع کرد(لحظه ای)`), clientController.terminated.bind(clientController))
router.get('/active-client', logMiddleware(null), clientController.activeUser.bind(clientController))
router.get('/active', logMiddleware(null), clientController.allSession.bind(clientController))
router.get('/device', clientController.macSession.bind(clientController))
router.post('/client', logMiddleware(null), logMiddleware(`یک کاربر جدید اضافه کرد`), clientController.create.bind(clientController))
router.get('/most-used', logMiddleware(null), clientController.mostUsed.bind(clientController))
router.get('/client/:id', logMiddleware(null), clientController.getOne.bind(clientController))
router.get('/update-session', logMiddleware(null), clientController.updataSession.bind(clientController))
router.put('/client/:id', logMiddleware(`یک کاربر را تغییر داد`), clientController.update.bind(clientController))
router.delete('/client/:id', logMiddleware(`یک کاربر را حذف کرد`), clientController.delete.bind(clientController))
router.get('/mac-dangeres', logMiddleware(null), clientController.dangeresMac.bind(clientController))
// router.get('/loger', clientController.loger.bind(clientController))

router.get('/block-client', logMiddleware(null), blockedClientController.getAll.bind(blockedClientController))
router.get('/useage', logMiddleware(null), blockedClientController.useage.bind(blockedClientController))
router.get('/block-clients', logMiddleware(null), blockedClientController.getAllProp.bind(blockedClientController))
router.get('/mac/:mac', logMiddleware(null), blockedClientController.macSession.bind(blockedClientController))
router.get('/block-mac', logMiddleware(null), blockedClientController.getAllMac.bind(blockedClientController))
router.post('/block-mac', logMiddleware(`یک دستگاه را به بلک لیست اضافه کرد`), blockedClientController.macBlocker.bind(blockedClientController))
router.get('/mac-back/:mac', logMiddleware(null), blockedClientController.macBack.bind(blockedClientController))
router.post('/block-client', logMiddleware(`یک کاربر را غیر فعال کرد`), blockedClientController.create.bind(blockedClientController))
router.get('/block-client/:id', logMiddleware(null), blockedClientController.getOne.bind(blockedClientController))
router.put('/block-client/:id', logMiddleware(`کاربر غیر فعال شده را تغییر داد`), blockedClientController.update.bind(blockedClientController))
router.delete('/block-client/:id', logMiddleware(`یک کاربر غیر فعال را فعال کرد`), blockedClientController.delete.bind(blockedClientController))

module.exports = router;
