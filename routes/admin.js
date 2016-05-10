var express = require('express');
var router = express.Router();
var admin = require('./admin/methods');

/* jixiang: Administrator login interface */
router.post('/login', admin.login);

/* jixiang: Administrator lists interface */
router.get('/backuser/list', admin.backuserList)

/* jixiang: User and advertiser lists interface  */
router.get('/user/list', admin.userList);

/* jixiang: Add administrator */
router.post('/backuser/create', admin.create);

/* jixiang: Administrator auth level manage */
router.post('/backuser/manage', admin.manage);

/* jixiang: Administrator modify personal info */
router.post('/backuser/modify', admin.modify);

/* jixiang: Get index page data interface */
router.get('/home', admin.home);

/* jixiang: Get user detail by user id */
router.get('/user/detail/:userid', admin.userDetailById);

/* jixiang: Verify user */
router.post('/user/audit', admin.userVerify);

/* jixiang: Statistics */
router.get('/statistics/dayincome', admin.dayIncome);

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

//ashun: Administrator ads search
router.post('/advert/search',admin.search);


module.exports = router;
