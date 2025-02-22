const express = require("express");
const router = express.Router();
const videoUpload = require('../../middlewares/videoUpload')
const picUpload = require('../../middlewares/picUpload')
const configUpload = require('../../middlewares/configUpload')
const activityLogger = require("../../middlewares/userLogger")




const routerController = require("app/api/routers");
const limitationController = require("app/api/limitation");
const profileController = require("app/api/profile");
const clientController = require("app/api/client");
const blockedClientController = require("app/api/blockedClient");




// router.get('/logout', userController.logout.bind(userController))
// router.post('/register', userController.register.bind(userController))
// router.post('/login', userController.login.bind(userController))


// router.use(activityLogger);
router.get('/routers', routerController.getAll.bind(routerController))
router.post('/routers', routerController.create.bind(routerController))
router.get('/routers/:id', routerController.getOne.bind(routerController))
router.get('/routers-connection/:id', routerController.connection.bind(routerController))
router.put('/routers/:id', routerController.update.bind(routerController))
router.delete('/routers/:id', routerController.delete.bind(routerController))

router.get('/limitation', limitationController.getAll.bind(limitationController))
router.get('/limitation-router', limitationController.getAllRouter.bind(limitationController))
router.post('/limitation', limitationController.create.bind(limitationController))
router.get('/limitation/:id', limitationController.getOne.bind(limitationController))
router.put('/limitation/:id', limitationController.update.bind(limitationController))
router.delete('/limitation/:id', limitationController.delete.bind(limitationController))

router.get('/profile', profileController.getAll.bind(profileController))
router.post('/profile', profileController.create.bind(profileController))
router.get('/profile/:id', profileController.getOne.bind(profileController))
router.put('/profile/:id', profileController.update.bind(profileController))
router.delete('/profile/:id', profileController.delete.bind(profileController))

router.get('/client', clientController.getAll.bind(clientController))
router.post('/client', clientController.create.bind(clientController))
router.get('/client/:id', clientController.getOne.bind(clientController))
router.put('/client/:id', clientController.update.bind(clientController))
router.delete('/client/:id', clientController.delete.bind(clientController))

router.get('/block-client', blockedClientController.getAll.bind(blockedClientController))
router.get('/block-clients', blockedClientController.getAllProp.bind(blockedClientController))
router.post('/block-client', blockedClientController.create.bind(blockedClientController))
router.get('/block-client/:id', blockedClientController.getOne.bind(blockedClientController))
router.put('/block-client/:id', blockedClientController.update.bind(blockedClientController))
router.delete('/block-client/:id', blockedClientController.delete.bind(blockedClientController))

module.exports = router;
