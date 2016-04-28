var Q = require('q');
var User = require('./user');
var Email = require('./email');
var ExternalAdvert = require('./../admin/advertisment');
var Advert = require('./advertisement')
var Token = require('../../lib/publicUtils');


// 广告商登陆
exports.login = function(req, res, next) {
    var data = req.body;
    User.authenticate(data.email, data.password, function(err, user){
        if (err) {
            res.json({
                errCode: err.message
            });
        }
        if (user) {
            var token = Token.getToken(user.id); //传入登录者的id生成token
            res.json({
                token: token,
                errCode: 0
            });
        } else {
            res.json({
               errCode: 102 //用户名或密码不正确
            });
        }
    });
};

// 邮箱注册验证
exports.check = function (req, res, nect) {
    var id = Token.token2id(req.query.token);
    console.log('id:' + id);
    if (id !== null) {
        // 根据ID修改用户check为true
        res.json({
            errCode: 0
        });
    } else {
        //邮箱验证码过期或错误，验证失败
        res.json({
            errCode: 107    
        });
    }
}

// 广告商注册
exports.signup = function(req, res, next) {
    var data = req.body;
    console.log(data);
    User.createNewAdvertiser(data, function (newUserId) {
        if (null !== newUserId) {
            var token = Token.getToken(newUserId);
            // 这个要根据host来拼
            var checkUrl = req.host + ':3000/advertiser/checkemail?token=' + token;
            
            // 给用户邮箱发送验证邮件
            var newUser = {
                name: data.username,
                targetMail: data.email,
                checkUrl: checkUrl
            }
            
            Email.sendEmail(newUser, function (response) {
                console.log(response);
            });
            
            res.json({
                errCode: '0'
            });
        } else {
            res.json({
                errCode: '104'
            });
        }
    });
};

// 获取已发布广告
exports.getAdvertisement = function (req, res, next) {
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
        //数据库查询
        Advert.getAllAdvertisement(id)
            .done(function (data) {
                res.json({
                    errCode: 0,
                    advertisement: data
                })
            })
    } else {
        res.json({
            errCode: 101
        });
    }
    
};

// 获取广告商圈
exports.getDistrict = function (req, res, next) {
    var token = req.query.token;
    var city = req.query.city;
    if (!token) {
        res.json({
            errCode: 102 //请求错误
        });
        next(err);
    }
    // token to id
    var id = Token.token2id(token);
    if (id != null) {
        //数据库查询
        Advert.district(city)
            .done(function (data) {
                res.json({
                    errCode: 0,
                    advertisement: data
                })
            })
    } else {
        res.json({
            errCode: 101
        });
    }
};

exports.submitAdvert = function (req,res,next) {
    var data = req.body;
    console.log(data);
    if (!data.token) {
        res.json({
            errCode: 102
        });
        next(err);
    }
    // token to id
    var id = Token.token2id(data.token);
    if (id != null) {
        Advert.submitAdvert(id, data, function (err,key) {
            if (err == null) {
                res.json({
                    errCode: 0,
                    id: key
                });
            } else {
                res.json({
                    errCode: 207, //广告上传失败
                    error: err
                });
            }
        })
    } else {
        res.json({
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

//获取消息记录
exports.messageList = function (req,res,next) {
    var token = req.query.token;
    if (!token) {
        res.json({
            errCode: 102
        });
        next(err);
    }
    // token to id
    var id = Token.token2id(token);
    if (id != null) {
        // 获取内容并处理
        User.getMessages(id)
            .done(function (data) {
                res.json({
                    errCode: 0,
                    messages: data
                });
            })
    } else {
        res.json({
            errCode: 101
        });
    }
};

//提交验证信息
exports.checkAccount = function (req,res,next) {
    var data = req.body;

    if (!data.token) {
        res.json({
            errCode: 102
        });
        next(err);
    }

    var id = Token.token2id(data.token);
    if (id != null) {
        var detail = data.detail;
        User.checkAccount(detail)
            .done(function () {
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

//