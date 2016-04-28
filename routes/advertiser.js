var express = require('express');
var router = express.Router();
var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
var advertiser = require('./advertiser/methods.js');

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

// 检查邮箱是否被注册，暂时不实现
router.post('/checkemail',function (req,res,next) {
  // console.log(req);
  // advertiser.signup(req, res, next);
  // res.send(req.body.username);
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
router.post('/advertisement/submit',function (req,res,next) {
  advertiser.submitAdvert(req,res,next);
});

// 将广告保存为草稿
router.post('/advertisement/save',function (req,res,next) {
  //code here
});

// 根据ID下架广告
router.post('/advertisement/remove',function (req,res,next) {
  //code here
});

// 根据ID获取广告详情(这个接口好像设计的有问题，我还不知道怎么实现，需要查一查)
router.get('/advertisement/',function (req,res,next) {
  //code here
});


/************** 广告商账户部分 ***********/
// 账户充值
router.post('/account/recharge',function (req,res,next) {
  advertiser.recharge(req,res,next);
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



/************** 统计部分 ***********/
// 获取广告统计列表
router.get('/statistics/all',function (req,res,next) {
  //code here
});

// 根据ID获取广告支出详情
router.get('/statistics/detail',function (req,res,next) {
  //code here
});

// 获取广告商支出和投放数据
router.get('/statistics/data',function (req,res,next) {
  //code here
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

module.exports = router;
