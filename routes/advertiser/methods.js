var Q = require('q');
var User = require('./user');
var Token = require('../../lib/publicUtils');


// 广告商登陆
exports.login = function(req, res, next) {
    var data = req.body;
    User.authenticate(data.email, data.password, function(err, user){
        if (err) {
            res.json({
                errCode: 104
            });
        }
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
};

// 广告商注册
exports.signup = function(req, res, next) {
    var data = req.body;
    var newUser = User.createNewAdvertiser(data);
};

// 检查邮箱是否已被注册
exports.checkEmail = function (req, res, next) {
    
};

// 获取已发布广告
exports.getReleasedAdvertisement = function (req, res, next) {
    var token = req.qurey.token;
    
    //token校验
    if (User.checkToken(token)) {
        //数据库查询
        
    } else {
        res.josn({
            errCode: 101
        });
    }
    
};


/******** 我是分割线 **********/

//广告商账户信息
exports.accountDetail = function (req,res,next) {
    var token = req.query.token;

    if (!token) {
        res.json({
            errCode: 102 //请求错误
        });
        next(err);
    }
    // token to id
    var id = Token.token2id(token);
    if (id != null) {
        // 获取内容并处理
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
};

//充值
exports.recharge = function (req,res,next) {
    var data = req.body;

    if (!data.token) {
        res.json({
            errCode: 102
        });
        next(err);
    }

    var id = Token.token2id(data.token);
    if (id != null) {
        User.recharge(id, data.recharge, data.Alipay)
            .done(function (data) {
                console.log(data);
                res.json({
                    errCode: 0
                })
            })
    } else {
        res.json({
            errCode: 101
        });
    }
};

//充值记录
exports.rechargeList = function (req,res,next) {
    var token = req.query.token;
    if (!token) {
        res.json({
            errCode: 102 //请求错误
        });
        next(err);
    }
    // token to id
    var id = Token.token2id(token);
    if (id != null) {
        // 获取内容并处理
        User.getRechargeList(id)
            .done(function(data) {
                res.json({
                    errCode: 0,
                    rechargeHistory: data
                });
            })
    } else {
        res.json({
            errCode: 101
        });
    }
};

// 退款
exports.refund = function (req,res,next) {
    var data = req.body;

    if (!data.token) {
        res.json({
            errCode: 102
        });
        next(err);
    }

    var id = Token.token2id(data.token);
    if (id != null) {
        User.refund.authenticate(id, data.refund)
            .then(function () { //resolve
                User.refund(id, data.refund, data.Alipay)
                    .done(function (data) {
                        console.log(data);
                        res.json({
                            errCode: 0
                        })
                    })
            }, function () { //reject
                res.json({
                    errCode: 301 // 退款金额大于余额
                })
            });
    } else {
        res.json({
            errCode: 101
        });
    }
};

//退款记录
exports.refundList = function (req,res,next) {
    var token = req.query.token;
    if (!token) {
        res.json({
            errCode: 102 //请求错误
        });
        next(err);
    }
    // token to id
    var id = Token.token2id(token);
    if (id != null) {
        // 获取内容并处理
        User.getRefundList(id)
            .done(function(data) {
                res.json({
                    errCode: 0,
                    refundHistory: data
                });
            })
    } else {
        res.json({
            errCode: 101
        });
    }
};