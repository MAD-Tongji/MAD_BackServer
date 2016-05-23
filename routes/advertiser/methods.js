var Q = require('q');
var User = require('./user');
var Email = require('./email');
var ExternalAdvert = require('./../admin/advertisment');
var Advert = require('./advertisement');
var Apply = require('./apply');
var City = require('./city');
var Statistic = require('./statistic');
var Token = require('../../lib/publicUtils');
var path = require('path');



/**
 * 广告商登陆
 * @param req
 * @param res
 * @param next
 */
exports.login = function(req, res, next) {
    var data = req.body;

    User.getAdvertiserByEmail(data.email)
        .then(function (user) {
            if (user.password === data.password) {
                var token = Token.getToken(user.id);
                console.log(Token.uptoken());
                res.json({
                    token: token,
                    name: user.name,
                    errCode: 0
                });
            } else {
                res.json({
                    errCode: 102
                });
            }
        }).catch(function (error) {
            res.json({
                errCode: 102
            });
        });
};

/**
 * 获取图片上传uptoken
 */
exports.getUpToken = function (req, res) {
    var token = req.query.token;
    console.log('token:' + token);
    if (!token || !Token.token2id(token)) {
        res.json({
            errCode: 101
        });
    } else {
        res.json({
            uptoken: Token.uptoken('madtest'),
            errCode: 0
        });
    }
};

/**
 * 邮箱注册验证
 * @param req
 * @param res
 * @param next
 */
exports.check = function (req, res, next) {
    var id = Token.token2id(req.query.token);
    console.log('id:' + id);
    if (id !== null) {
        // 根据ID修改用户check为true
        
        User.completeEmailCheck(id)
            .done(function () {
                res.set({
                    'Content-Type': 'text/html;charset=utf-8'
                });
                res.sendFile(path.resolve('views/check-success.html'));
            }, function (error) {
                console.log('用户：' + id +'邮箱验证失败');
                console.log(error);

                res.set({
                    'Content-Type': 'text/html;charset=utf-8'
                });
                res.sendFile(path.resolve('views/check-fail.html'));
            });
    } else {
        //邮箱验证码过期或错误，验证失败
        res.set({
            'Content-Type': 'text/html;charset=utf-8'
        });
        res.sendFile(path.resolve('views/check-error.html'));
    }
}

/**
 * 广告商注册
 * @param req
 * @param res
 * @param next
 */
exports.signup = function(req, res, next) {
    var data = req.body;
    console.log(data);
    User.createNewAdvertiser(data, function (newUserId) {
        if (null !== newUserId) {
            var token = Token.getToken(newUserId);
            // 根据host来拼
            var checkUrl = req.host + ':4000/advertiser/checkemail?token=' + token;
            
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
                errCode: 0
            });
        } else {
            res.json({
                errCode: 104
            });
        }
    });
};

/**
 * 获取已发布广告
 * @param req
 * @param res
 * @param next
 */
exports.getAdvertisement = function (req, res, next) {
    var token = req.query.token;
    if (!token || !Token.token2id(token)) {
        res.json({
            errCode: 101
        });
    } else {
        // token to id
        var id = Token.token2id(token);
        //数据库查询
        Advert.getAllAdvertisement(id)
            .done(function (data) {
                res.json({
                    errCode: 0,
                    advertisement: data
                });
            });
    }    
};

/**
 * 获取广告商圈
 * @param req
 * @param res
 * @param next
 */
exports.getDistrict = function (req, res, next) {
    var token = req.query.token;
    var city = req.query.city;
    if (!token || !Token.token2id(token)) {
        res.json({
            errCode: 101
        });
    } else {
        //数据库查询
        City.district(city)
            .done(function (data) {
                res.json({
                    errCode: 0,
                    broadcastLocation: data
                });
            });
    }
};

/**
 * 发布广告
 * @param req
 * @param res
 * @param next
 */
exports.submitAdvert = function (req,res,next) {
    var data = req.query;
    console.log(data);
    if (!data.token || !Token.token2id(data.token)) {
        res.json({
            errCode: 101
        });
    } else {
        if (data.id) {
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
        } else {
            res.json({
                errCode: 399
            });
        }
        
    }
};

/**
 * 保存草稿
 * @param req
 * @param res
 * @param next
 */
exports.saveAdvert = function (req,res,next) {
    var data = req.body;
    if (!data.token || !Token.token2id(data.token)) {
        res.json({
            errCode: 101
        });
    } else {
        // token to id
        var id = Token.token2id(data.token);
        
        // 判断广告是否有ID
        if (data.id) {
            // 有ID，更新广告
            Advert.updateAdvertDraft(id, data, function (error) {
                if (error) {
                    res.json({
                        errCode: 210
                    });
                } else {
                    //行政区映射
                    City.modifyAdvertById(data.id,data.city,data.catalog,data.add,data.remove)
                        .done(function () {
                            res.json({
                                errCode: 0,
                                id: data.id
                            });
                        }, function (error) { //reject
                            res.json({
                                errCode: 306 //行政区映射失败
                            });
                        });
                }
            });
        } else {
            // 没有ID，新建广告
            Advert.saveAdvert(id, data, function (err,key) {
                if (err === null) {
                    // 行政区映射
                    var locations = data.broadcastLocation;
                    locations.forEach(function (location) {
                        City.addAdvertMapping(key, data.city, location, data.catalog);
                    });
                    // 返回值
                    res.json({
                        errCode: 0,
                        id: key
                    });
                } else {
                    res.json({
                        errCode: 207 //广告上传失败
                    });
                }
            });
        }
        
    }
};

/**
 * 广告下架
 * @param req
 * @param res
 * @param next
 */
exports.removeAdvert = function (req,res,next) {
    var token = req.body.token;
    if (!token || !Token.token2id(token)) {
        res.json({
            errCode: 101
        });
    } else {
        var id = Token.token2id(token);
        var advertId = req.body.id;
        if (advertId) {
            Advert.removeAdvertById(id, advertId)
                .then(function () {
                    res.json({
                        errCode: 0
                    });
                }).catch(function (error) {
                    res.json({
                        errCode: 208,
                        errMessage: error.message
                    });
                });
        } else {
            res.json({
                errCode: 999,
                errMessage: 参数不正确
            });
        }
    }
};

/**
 * 用id取广告内容
 * @param req
 * @param res
 */
exports.getAdvertById = function (req,res) {
    var token = req.query.token;

    if (!token|| !Token.token2id(token)) {
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

/**
 * 广告商账户信息
 * @param req
 * @param res
 * @param next
 */
exports.accountDetail = function (req,res,next) {
    var token = req.query.token;

    if (!token) {
        res.json({
            errCode: 102 //请求错误
        });
        next(err);
    } else {
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
    }
};

/**
 * 充值
 * @param req
 * @param res
 * @param next
 */
exports.recharge = function (req,res,next) {
    var data = req.body;

    if (!data.token) {
        res.json({
            errCode: 102
        });
        next(err);
    } else {
        var id = Token.token2id(data.token);
        if (id != null) {
            User.recharge(id, data.recharge, data.Alipay, function (err, key) {
                if (err === null) {
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
    }    
};

/**
 * 充值记录
 * @param req
 * @param res
 * @param next
 */
exports.rechargeList = function (req,res,next) {
    var token = req.query.token;
    if (!token || !Token.token2id(token)) {
        res.json({
            errCode: 101 //请求错误
        });
        next(err);
    } else {
        // token to id
        var id = Token.token2id(token);
        // 获取内容并处理
        User.getRechargeList(id)
            .done(function(data) {
                res.json({
                    errCode: 0,
                    rechargeHistory: data
                });
            });
    }
};

/**
 * 退款
 * @param req
 * @param res
 * @param next
 */
exports.refund = function (req,res,next) {
    var data = req.body;
    console.log(data);

    if (!data.token) {
        res.json({
            errCode: 102
        });
        next(err);
    } else {
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
    }    
};

/**
 * 退款记录
 * @param req
 * @param res
 * @param next
 */
exports.refundList = function (req,res,next) {
    var token = req.query.token;
    if (!token || !Token.token2id(token)) {
        res.json({
            errCode: 101 //请求错误
        });
        next(err);
    } else {
        // token to id
        var id = Token.token2id(token);
        // 获取内容并处理
        User.getRefundList(id)
            .done(function(data) {
                res.json({
                    errCode: 0,
                    refundHistory: data
                });
            });
    }
};

/**
 * 获取消息记录
 * @param req
 * @param res
 * @param next
 */
exports.messageList = function (req,res,next) {
    var token = req.query.token;
    if (!token || !Token.token2id(token)) {
        res.json({
            errCode: 101
        });
    } else {
        var id = Token.token2id(token);
        User.getMessages(id)
            .then(function (data) {
                res.json({
                    errCode: 0,
                    messages: data
                });
            }).catch(function (error) {
                res.json({
                    errCode: 999,
                    errMessage: error.message
                });
            });
    }
};

/**
 * 提交验证信息
 * @param req
 * @param res
 * @param next
 */
exports.checkAccount = function (req,res,next) {
    var data = req.body;
    if (!data.token || !Token.token2id(data.token)) {
        res.json({
            errCode: 101
        });
        next(err);
    } else {
        if (data.detail) {
            var detail = data.detail;
            var id = Token.token2id(data.token);
            User.checkAccount(detail, id)
                .then(function () {
                    res.json({
                        errCode: 0
                    });
                }, function (error) {
                    res.json({
                        errCode: 302
                    });
                });
        } else {
            res.json({
                errCode: 302
            });
        }
    }
};

/**
 * 修改密码
 * @param req
 * @param res
 * @param next
 */
exports.changePassword = function (req,res,next) {
    var data = req.body;
    console.log(data);

    if (!data.token) {
        res.json({
            errCode: 101
        });
        next(err);
    } else {
        var id = Token.token2id(data.token);
        if (id != null) {
            User.changePassword(id,data.oldPwd,data.newPwd)
                .then(function () { //resolve
                    res.json({
                        errCode: 0
                    });
                }, function (error) { //reject
                    res.json({
                        errCode: 305 // 旧密码不对
                    })
                });
        } else {
            res.json({
                errCode: 101
            });
        }
    }
};

/**
 * 修改支付宝
 * @param req
 * @param res
 * @param next
 */
exports.changeAlipay = function (req,res,next) {
    var data = req.body;
    console.log(data);

    if (!data.token) {
        res.json({
            errCode: 101
        });
        next(err);
    } else {
        var id = Token.token2id(data.token);
        if (id != null) {
            User.changeAlipay(id,data.Alipay)
                .done(function () { //resolve
                    res.json({
                        errCode: 0
                    });
                });
        } else {
            res.json({
                errCode: 101
            });
        }
    }
};

exports.getAccountCheckDetail = function (req,res,next) {
    var token = req.query.token;

    if (!token) {
        res.json({
            errCode: 101
        });
        next(err);
    } else {
        var id = Token.token2id(token);
        if (id != null) {
            User.getAccountCheckDetail(id)
                .done(function (data) { //resolve
                    res.json({
                        errCode: 0,
                        detail: data
                    });
                });
        } else {
            res.json({
                errCode: 101
            });
        }
    }
};

//TODO: errCode102问题


/*------------------------- 我是分割线------------------*/
// 获取广告统计列表
exports.getAdvertisementsStatistics = function (req, res) {
    var token = req.query.token;
    
    if (!token || !Token.token2id(token)) {
        res.json({
            errCode: 101
        });
    } else {
        var advertiserId = Token.token2id(token);
        Statistic.getAllStatistic(advertiserId)
            .then(function (result) {
                res.json({
                    errCode: 0,
                    advertisement: result
                });
            }).catch(function (error) {
                res.json({
                    errCode: 999,
                    errMessage: error.message
                });
            });
    }
};

// 根据ID获取广告支出和播放数据
exports.getAdvertisementStatisticDetail = function (req, res) {
    var token = req.query.token;
    
    if (!token || !Token.token2id(token)) {
        res.json({
            errCode: 101
        });
    } else {
        var advertiserId = Token.token2id(token);
        var advertId = req.params.id;
        
        Statistic.getAdvertisementDetail(advertId, advertiserId)
            .then(function (result) {
                res.json({
                    errCode: 0,
                    statistics: result
                });
            }).catch(function (error) {
                res.json({
                    errCode: 999,
                    errMessage: error.message
                });
            });
    }
}

// 获取广告商支出和投放数据
exports.getAdvertiserStatistic = function (req, res) {
    var token = req.query.token;
    
    if (!token || !Token.token2id(token)) {
        res.json({
            errCode: 101
        });
    } else {
        var advertiserId = Token.token2id(token);
        
        
        Statistic.getAdvertiserData(advertiserId)
            .then(function (result) {
                res.json({
                    errCode: 0,
                    advertisement: result
                });
            }).catch(function (error) {
                res.json({
                    errCode: 999,
                    errMessage: error.message
                });
            });
    } 
}

