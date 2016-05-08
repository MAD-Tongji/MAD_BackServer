var Q = require('q');
var User = require('./user');
var Email = require('./email');
var ExternalAdvert = require('./../admin/advertisment');
var Advert = require('./advertisement');
var Apply = require('./apply');
var Token = require('../../lib/publicUtils');
var qcloud = require('qcloud_cos');     //腾讯云
qcloud.conf.setAppInfo('10035512','AKIDs7AklOniibC7X0shwTGBhLX5cVpZ5ql1','6oUOZwEh3DouaghoSZEWQcKsdDDRCUId'); 

// 设置腾讯云，图片上传接口
exports.uploadPic = function (req, res, next) {
    // 先把req中的数据存到服务器上
    
    // 服务器上存好了图片开始上传
    var expired = parseInt(Date.now() / 1000) + 60*60;
    var sign  = qcloud.auth.signMore('mad', expired);
    
    qcloud.cos.upload('文件在本地的全路径', 'mad', '/', function(ret) {
        if (0 === ret.code) {
            console.log('上传成功，url:');
            console.log(ret.data.access_url);
            // 上传完成后返回图片URL
            
        } else {
            console.log('上传图片错误');
            console.log(ret.message);
            // 上传失败后返回errCode
        }
    });
}

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
exports.check = function (req, res, next) {
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
            };
            
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

//发布广告
exports.submitAdvert = function (req,res,next) {
    var data = req.query;
    console.log(data);
    if (data.token === undefined || data.token === null || Token.token2id(data.token) === null) {
        res.json({
            errCode: 101
        });
    } else {
        if (data.id === undefined || data.id === null) {
            res.json({
                errCode: 201
            });
        } else {
            Advert.releaseNewAdvert(data.id, function (err,key) {
                if (err === null) {
                    res.json({
                        errCode: 0,
                        id: key
                    });
                } else {
                    res.json({
                        errCode: err.message //发布广告失败
                    });
                }
            });
        }
        
    }
};

//保存草稿
exports.saveAdvert = function (req,res,next) {
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
        Advert.saveAdvert(id, data, function (err,key) {
            if (err == null) {
                // 广告映射
                User.saveAdvert("advertiser", id, key);
                // 返回值
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

//广告下架
exports.removeAdvertById = function (req,res,next) {
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
    var adId = data.id;
    if (id != null) {
        Advert.removeAdvertById(id, adId, function (err) {
            if (err == null) {
                res.json({
                    errCode: 0
                });
            } else {
                res.json({
                    errCode: 208, //广告下架失败
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

//用id取广告内容
exports.getAdvertById = function (req,res) {
    var token = req.query.token;

    if (token === undefined || token === null  || Token.token2id(token) === null) {
        console.log('token:' + token);
        console.log('id:' + Token.token2id(token));
        res.json({
            errCode: 101 //请求错误
        });
    } else {
        // 获取广告内容
        var adId = req.params.id;
        if (adId !== null || adId !== undefined) {
            Advert.getAdvertById(adId)
            .done(function(data) {
                if (data !== null) {
                    res.json({
                        errCode: 0,
                        advertisement: data
                    });
                } else {
                    res.json({
                        errCode: 201
                    });
                }
            });
        } else {
            res.json({
                errCode: 201
            });
        }
    }
};

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
        User.recharge(id, data.recharge, data.Alipay, function (err, key) {
            if (err == null) {
                Apply.createApplyById(key, id, "recharge")
                    .done(function (data) {
                        console.log(data);
                        res.json({
                            errCode: 0
                        });
                    });
            }
        });
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
    console.log(data);

    if (!data.token) {
        res.json({
            errCode: 102
        });
        next(err);
    }

    var id = Token.token2id(data.token);
    if (id != null) {
        User.refund.authenticate(id, data.refund)
            .then(function (result) { //resolve
                User.refund(id, data.refund, data.Alipay, function (err, key) {
                    if (err == null) {
                        Apply.createApplyById(key, id, "refund")
                            .done(function (data) {
                                console.log(data);
                                res.json({
                                    errCode: 0
                                });
                            });
                    }
                });
            }, function (error) { //reject
                res.json({
                    errCode: 304 // 退款金额大于余额
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