var express = require('express');
var router = express.Router();
var admin = require('./admin/methods');

/* GET admin listing. */
router.get('/', function(req, res, next) {
    res.send('here is admin');
});

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

module.exports = router;