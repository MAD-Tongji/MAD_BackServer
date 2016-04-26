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

exports.accountDetail = function (req,res,next) {
    var token = req.query.token;
    var id = req.query.id;

    if (!token || !id) {
        res.json({
            errCode: 102 //请求错误
        });
        next(err);
    }

    authenticate(token, function (err, result) {
        if (err) return next(err);
        if (result) {
            User.getAccountDetail(id)
                .done(function(data) {
                    res.json({
                        errCode: 0,
                        advertiser: data
                    });
                })
        } else {
            res.json({
                errCode: 101
            });
        }
    })
}

function authenticate(token, fn) {
    var assignedToken = getToken(token, function(err, result) {
        if (err) fn(err);
        if (result) {
            return fn(null, 1);
        } else {
            return fn();
        }
    })
}

function getToken(token, fn) {
    /* 获取token逻辑，现在缺token映射表 */
    /* 先用token值为1进行模拟认证 */
    if (token == "testtoken") return fn(null, 1);
    fn();
}