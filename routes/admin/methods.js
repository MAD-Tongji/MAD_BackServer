var Q = require('q');
var User = require('./user');
var Advertisment = require('./advertisment');
var Account = require('./account');
var List = require('./list');
var Token = require('../../lib/publicUtils');

//*********** ashun: ads api****************
exports.submit = function(req, res, next){
    var data = req.body;
    if(Token.token2id(data.token) == null){
        res.json({
            errCode: 101
        })
    }else{
    Advertisment.addNew(data, function(err,key){
        if(err == null){
            res.json({
            errCode: 0,
            id: key
        });
        }
   });
}
}

exports.save = function(req, res, next){
    var data = req.body;
    if(Token.token2id(data.token) == null){
        res.json({
            errCode: 101
        })
    }else{
    Advertisment.saveDraft(data, function(err,key){
        if(err == null){
            res.json({
            errCode: 0,
            id: key
        });
        }
   });
}
}

exports.listAll = function(req, res, next){
    var data = req.body;
    if(Token.token2id(data.token) == null){
        res.json({
            errCode: 101
        })
    }else{
    Advertisment.listAll(data).done(function(data){
        res.json({
            AdsList:data,
            errCode: 0
        });
    });
}
}

exports.audit = function(req, res, next){
    var data = req.body;
    if(Token.token2id(data.token) == null){
        res.json({
            errCode: 101
        })
    }else{
    Advertisment.audit(data).done(function(data){
        if(data == null){
            res.json({
                errCode: 0
            });
        }else{
            res.json({
                errCode: 206
            });
        }
    });
}
}

exports.remove = function(req, res, next){
    var data = req.body;
    if(Token.token2id(data.token) == null){
        res.json({
            errCode: 101
        })
    }else{
    Advertisment.remove(data).done(function(data){
        if(data == null){
        res.json({
            errCode: 0
        });
    }else{
        
    }
    });
}
}

exports.detail = function(req, res, next){
    var data = req.body;
    if(Token.token2id(data.token) == null){
        res.json({
            errCode: 101
        })
    }else{
    Advertisment.detail(data).done(function(data){
        if(data){
        res.json({
            errCode: 0,
            adsDetail: data
        });
    }else{
        res.json({
            errCode: 206
        })
    }
    });
}

}

exports.accountList = function(req, res, next){
    var data = req.body;
    if(Token.token2id(data.token) == null){
        res.json({
            errCode: 101
        })
    }else{
        Account.accountList(data).done(function(data){
            if(data){
                res.json({
                    errCode: 0,
                    accountList: data
                });
            }else{
                res.json({
                    errCode: 999
                })
            }
        });
    
}

}

exports.applyList = function(req, res, next){
    var data = req.body;
    if(Token.token2id(data.token) == null){
        res.json({
            errCode: 101
        })
    }else{
        Account.applyList(data).done(function(data){
            if(data){
                res.json({
                    errCode: 0,
                    applyList: data
                });
            }else{
                res.json({
                    errCode: 999
                })
            }
        });
    
}

}

//完成申请
exports.complete = function(req, res, next){
    var data = req.body;
    if(Token.token2id(data.token) == null){
        res.json({
            errCode: 101
        })
    }else{
        Account.complete(data).done(function(data){
            if(!data){
                res.json({
                    errCode: 0,
                });
            }else{
                res.json({
                    errCode: 999
                })
            }
        });
    
}

}

//*********** ashun: end ****************

exports.login = function(req, res, next){
    var data = req.body;
    User.authenticate(data.name, data.pass, function(err, user){
        if (err) return next(err);
        if (user) {
            console.log(user.id);
            var token = Token.getToken(user.id); //传入登录者的id生成token
            res.json({
                token: token,
                errCode: 0
            });
        } else {
            res.json({
               errCode: 104 //用户名或密码不正确
            });
        }
    })
}

exports.userList = function(req, res, next) {
    var token = req.query.token;
    var tag = req.query.tag;
    if (!token || !tag) {
        res.json({
            errCode: 102 //请求错误
        });
        next(err);
    }

    //与颁发的token作比较
    authenticate(token, function(err, result) {
        if (err) return next(err);
        if (result) {
            if (tag == 1) {
                List.getUserIds()
                .done(function(data) {
                    List.getCarUserList(data)
                    .done(function(data) {
                        res.json({
                            errCode: 0,
                            userList: data
                        });
                    })
                })
            } else if (tag == 2) {
                List.getAdvertiserIds()
                .done(function(data) {
                    List.getAdvertiserList(data)
                    .done(function(data) {
                        res.json({
                            errCode: 0,
                            advertiserList: data
                        });
                    })
                })
            }
        } else {
            res.json({
                errCode: 101 //令牌不存在或已经过期
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
    /*  token验证 */
    if (Token.token2id(token)) return fn(null, 1);
    fn();
}

exports.backuserList = function(req, res, next) {
    var token = req.query.token;

    if (!token) {
        res.json({
            errCode: 102 //请求错误
        });
    }
    //与颁发的token作比较
    authenticate(token, function(err, result) {
        if (err) return next(err);
        if (result) {
            User.getAllId()
            .done(function(data) {
                getAllList(data)
                .done(function(data) {
                    res.json({
                        errCode: 0,
                        backUserList: data
                    });     
                })
            }) 
        } else {
            res.json({
                errCode: 101 //令牌不存在或已经过期
            });
        }
    })
}

function getAllList(ids) {
    var deferred = Q.defer();
    var listArr = [];
    if (ids) {
        for (var id in ids) {
            (function(id) {
                User.get(ids[id])
                .done(function(data) {
                    listArr.push(data.toJSON());
                    deferred.resolve(listArr);
                })
            })(id);
        }
    }
    return deferred.promise;
}

exports.create = function(req, res, next) {
    var data = req.body;
    if (!data.token) {
        res.json({
            errCode: 102 //请求错误
        });
        next(err);
    }

    authenticate(data.token, function(err, result) {
        if (err) return next(err);
        if (result) {
            var newAdmin = new User({
                name: data.userName,
                pass: '12345678',
                email: data.email,
                gender: data.gender,
                level: data.level,
                hireDate: data.hireDate
            });
            newAdmin.save(function(err) {
                if (err){
                    res.json({
                        errCode: 106 //用户名已存在
                    });
                    throw (err);
                }
                res.json({
                    errCode: 0
                });
                
            })
        } else {
            res.json({
                errCode: 101 //令牌不存在或已经过期
            })
        }
    })
}

exports.manage = function(req, res, next) {
    var data = req.body;
    if (!data.token) {
        res.json({
            errCode: 102 //请求错误
        });
        next(err);
    }
    var id = data.id;
    var level = data.newLevel;
    authenticate(data.token, function(err, result) {
        if (err) return next(err);
        if (result) {
            User.getById(data.id)
            .done(function(data) {
                console.log(data);
                User.updateLevel(data, level, function(err) {
                    if (err) next(err);
                    res.json({
                        errCode: 0
                    });
                })
            })
        } else {
            res.json({
                errCode: 101 //令牌不存在或已经过期
            });
        }
    })
}

exports.modify = function(req, res, next) {
    var data = req.body;
    var email = data.email;
    var pass = data.password;
    if (!data.token) {
        res.json({
            errCode: 102 //请求错误
        });
        next(err);
    }
    authenticate(data.token, function(err, result) {
        if (err) return next(err);
        if (result) {
            User.getById(data.id)
            .done(function(data) {
                User.updateInfo(data, email, pass, function(err) {
                    if (err) next(err);
                    res.json({
                        errCode: 0
                    });
                })
            })
        } else {
            res.json({
                errCode: 101 //令牌不存在或已经过期
            });
        }
    })
}

exports.home = function(req, res, next) {
    var token = req.query.token;
    if (!token) {
        res.json({
            errCode: 102 //请求错误
        });
    }
    //与颁发的token作比较
    authenticate(token, function(err, result) {
        if (err) return next(err);
        if (result) {
            List.getHomeData()
            .done(function(data) {
                res.json({
                    errCode: 0,
                    totalAdvertiser: data.totalAdvertiser,
                    totalAdvertisement: data.totalAdvertisement,
                    totalUser: data.totalUser,
                    totalBroadcastTimes: data.totalBroadcastTimes,
                    advert_detail7: data.advert_detail7,
                    advert_most: data.advert_most,
                    newUser: data.newUser,
                    newAdvertiser: data.newAdvertiser,
                    newAdvertisement: data.newAdvertisement,
                    newBroadcastTimes: data.newBroadcastTimes
                    /* 缺下载量*/
                })
            })
        } else {
            res.json({
                errCode: 101 //令牌不存在或已经过期
            });
        }
    })
}