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

//ashun: Administrator add ads
router.post('/advert/submit',admin.submit);

//ashun: Administrator save ads draft
router.post('/advert/save',admin.save);

//ashun: Administrator get list of all ads
router.post('/advert/list/all',admin.listAll);

//ashun: Administrator audit ads
router.post('/advert/audit',admin.audit);

//ashun: Administrator remove ads
router.post('/advert/remove',admin.remove);
module.exports = router;