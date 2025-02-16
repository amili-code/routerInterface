const express = require("express");
const router = express.Router();
const videoUpload = require('../../middlewares/videoUpload')
const picUpload = require('../../middlewares/picUpload')
const configUpload = require('../../middlewares/configUpload')
const activityLogger = require("../../middlewares/userLogger")




const routerController = require("app/api/routers");




// router.get('/logout', userController.logout.bind(userController))
// router.post('/register', userController.register.bind(userController))
// router.post('/login', userController.login.bind(userController))


// router.use(activityLogger);
router.get('/routers', routerController.getAll.bind(routerController))
router.post('/routers', routerController.create.bind(routerController))
router.get('/routers/:id', routerController.getOne.bind(routerController))
router.put('/routers/:id', routerController.update.bind(routerController))
router.delete('/routers/:id', routerController.delete.bind(routerController))


module.exports = router;
