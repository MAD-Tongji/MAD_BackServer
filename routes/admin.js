var express = require('express');
var router = express.Router();
var admin = require('./admin/methods');

/* Administrator login interface */
router.post('/login', admin.login);

/* Administrator lists interface */
router.get('/backuser/list', admin.backuserList)

/* User and advertiser lists interface  */
router.get('/user/list', admin.userList);

/* Add administrator */
router.post('/backuser/create', admin.create);

/* Administrator auth level manage */
router.post('/backuser/manage', admin.manage);

/* Administrator modify personal info */
router.post('/backuser/modify', admin.modify);

/* Get index page data interface */
router.get('/home', admin.home);
module.exports = router;