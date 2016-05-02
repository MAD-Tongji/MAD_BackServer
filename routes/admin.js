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

//ashun: Administrator remove ads
router.post('/advert/detail',admin.detail);

//ashun: Administrator get account list
router.post('/account/list',admin.accountList);

//ashun: Administrator get all apply list
router.post('/account/apply/list',admin.applyList);

//ashun: Administrator complete the apply
router.post('/account/apply/complete',admin.complete);

/* Get index page data interface */
router.get('/home', admin.home);
module.exports = router;