var Q = require('q');
var User = require('./user');
var Token = require('../../lib/publicUtils');


// 参考文档https://z.wilddog.com/web/crud#cha-xun-shu-ju0
exports.login = function(req, res, next) {
    var data = req.body;
    User.authenticate(data.email, data.password, function(err, user){
        if (err) return next(err);
        if (user) {
            var token = Token.getToken(user.id); //传入登录者的id生成token
            res.json({
                token: token,
                id: user.id,
                errCode: 0
            });
        } else {
            res.json({
               errCode: 104 //用户名或密码不正确
            });
        }
    });
}

exports.signup = function(req, res, next) {
    //新建广告商
    //这里如何回调？
    advertiserRef.child('newAdvertiserId').set({
        //初始化数据
        Alipay: "String",
        advertisment: {},
        balance: 0,
        currentBroadcast: 0,
        detail: {},
        email: "test@test.com",
        expiration: "",
        message: {},
        name: "String",
        password: "123456",
        recharge: {},
        refund: {},
        status: false,
        token: "生成随机token"
    });
}





















/******** 我是分割线 **********/








