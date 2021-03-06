var express = require('express');
var router = express.Router();
var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
var advertiser = require('./advertiser/methods.js');
var advertisement = require('./advertiser/advertisement.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('here is advertiser');
});
/* GET/POST lister*/


/************** 登陆注册部分 ***********/
// 登录
router.post('/login',function (req,res,next) {
    advertiser.login(req, res, next);
});

// 注册
router.post('/signup',function (req,res,next) {
  advertiser.signup(req, res, next);
});

// 邮箱注册验证
router.get('/checkemail',function (req,res,next) {
  advertiser.check(req, res, next);
});

/************** 广告部分 ***********/
// 查看已发布广告列表
router.get('/advertisement/list/all',function (req,res,next) {
  advertiser.getAdvertisement(req,res,next);
});

// 获取投放商圈列表
router.get('/advertisement/district/all',function (req,res,next) {
  advertiser.getDistrict(req,res,next);
});

// 发布新广告
router.get('/advertisement/release',function (req,res,next) {
  advertiser.submitAdvert(req,res,next);
});

// 将广告保存为草稿
router.post('/advertisement/save',function (req,res,next) {
  advertiser.saveAdvert(req,res,next);
});

// 根据ID下架广告
router.post('/advertisement/remove',function (req,res,next) {
  advertiser.removeAdvert(req,res,next);
});

// 根据ID获取广告详情
router.get('/advertisement/:id?',function (req,res) {
  advertiser.getAdvertById(req,res);
});


/************** 广告商账户部分 ***********/
// 账户充值
router.post('/account/recharge',function (req,res,next) {
  advertiser.recharge(req,res,next);
});

// 修改密码
router.post('/account/changePwd',function (req,res,next) {
  advertiser.changePassword(req,res,next);
});

// 修改支付宝
router.post('/account/changeAlipay',function (req,res,next) {
  advertiser.changeAlipay(req,res,next);
});

// 获取广告商账户信息
router.get('/account/detail',function (req,res,next) {
  advertiser.accountDetail(req,res,next);
});

// 获取充值记录
router.get('/account/recharge/all',function (req,res,next) {
  advertiser.rechargeList(req,res,next);
});

// 获取退款记录
router.get('/account/refund/all',function (req,res,next) {
  advertiser.refundList(req,res,next);
});

// 申请退款
router.post('/account/refund',function (req,res,next) {
  advertiser.refund(req,res,next);
});

// 提交验证信息
router.post('/account/check',function (req,res,next) {
  advertiser.checkAccount(req,res,next);
});

// 获取验证信息
router.get('/account/check/detail', function (req,res,next) {
  advertiser.getAccountCheckDetail(req,res,next);
});

// 获取图片上传uptoken
router.get('/account/check/uptoken', function (req, res, next) {
  advertiser.getUpToken(req, res);
});

/************** 统计部分 ***********/
// 获取广告统计列表
router.get('/statistics/all',function (req,res,next) {
  advertiser.getAdvertisementsStatistics(req, res);
});

// 根据ID获取广告支出和播放数据
router.get('/statistics/detail/:id?',function (req,res,next) {
  advertiser.getAdvertisementStatisticDetail(req, res);
});

// 获取广告商支出和投放数据
router.get('/statistics/data',function (req,res,next) {
  advertiser.getAdvertiserStatistic(req, res);
});

//消息部分
// 获取消息列表
router.get('/message',function (req,res,next) {
  advertiser.messageList(req,res,next);
});

/************** 杂项 ***********/
// 查询服务器当前时间
router.get('/time',function (req,res,next) {
  //code here
});

//test
router.get('/test', function (req,res,next) {
  advertisement.broadcastOnce(req.query.id);
  res.json({
    errCode: 0
  });
});

module.exports = router;
