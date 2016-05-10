var Q = require('q');
var User = require('./user');
var Advertisment = require('./advertisment');
var Account = require('./account');
var List = require('./list');
var Token = require('../../lib/publicUtils');

//*********** ashun: start ****************
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
            notAuditAdsList:data,
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
        res.json({
            errCode: data
        });
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
    if (data.operatorEmail && data.operatorPassword) {
        User.authenticate(data.operatorEmail, data.operatorPassword, function(err, user){
            if (err) return next(err);
            if (user) {
            console.log(user.id);
            Account.complete(data).done(function(data){
            if(!data){
                res.json({
                    errCode: 0,
                });
            }else{
                res.json({
                    errCode: data
                })
            }
        });
                
            } else {
                res.json({
                    errCode: 102 //用户名或密码不正确
                });
            }
        })
    } else {
        res.json({
            errCode: 108  //参数不正确
        })
    }





     
    
}

}

//*********** ashun: end ****************

//***********jixiang: start ************

/**
 * @interface
 * @description {interface} 用户登录，参数为用户名，密码
 * @param {String} name 用户名
 * @param {String} pass 登陆密码
 * @return {JSON} 登录成功 {errCode, token} 登陆失败 {errCode}
 */
exports.login = function(req, res, next){
    var data = req.body;
    if (data.name && data.pass) {
        User.authenticate(data.name, data.pass, function(err, user){
            if (err) return next(err);
            if (user) {
                console.log(user.id);
                var token = Token.getToken(user.id); //传入登录者的id生成token
                res.json({
                    token: token,
                    id: user.id,
                    errCode: 0
                });
            } else {
                res.json({
                    errCode: 102 //用户名或密码不正确
                });
            }
        })
    } else {
        res.json({
            errCode: 108  //参数不正确
        })
    }
    
}

/**
 * @interface
 * @description {interface} 获取用户列表，参数为token, tag
 * @param {String} token
 * @param {String} tag tag= 1 : 车主用户; tag= 2 : 广告商用户
 * @return {JSON} 成功 {errCode, userList} 登陆失败 {errCode}
 */
exports.userList = function(req, res, next) {
    var token = req.query.token;
    var tag = req.query.tag;
    if (!token || !tag) {
        res.json({
            errCode: 108 //请求错误
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

/**
 * token验证函数
 */
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
    // if (Token.token2id(token)) return fn(null, 1);
    if (Token.token2id(token)) return fn(null, 1);
    fn();
}

/**
 * @interface
 * @description {interface} 获取后台管理员列表，参数为token
 * @param {String} token
 * @return {JSON} 成功 {errCode, backUserList} 登陆失败 {errCode}
 */
exports.backuserList = function(req, res, next) {
    var token = req.query.token;

    if (!token) {
        res.json({
            errCode: 108 //请求错误
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

/**
 * 获取所有用户列表函数
 */
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

/**
 * @interface
 * @description {interface} 新建管理员，参数为token, name, pass, emnail. gender, level, hireDate
 * @param {String} token
 * @param {String} name 用户名
 * @param {String} pass 密码
 * @param {String} email 邮箱
 * @param {String} gender 性别
 * @param {String} level 管理级别
 * @param {String} hireDate 工作开始日期
 * @return {JSON} 成功 {errCode} 登陆失败 {errCode}
 */
exports.create = function(req, res, next) {
    var data = req.body;
    if (!data.token) {
        res.json({
            errCode: 108 //请求错误
        });
        next(err);
    }

    authenticate(data.token, function(err, result) {
        if (err) return next(err);
        if (result) {
            var newAdmin = new User({
                name: data.userName,
                pass: '12345678', //初始密码
                email: data.email,
                gender: data.gender,
                level: data.level,
                hireDate: data.hireDate
            });
            newAdmin.save(function(err) {
                if (err){
                    res.json({
                        errCode: 404 //用户名已存在
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

/**
 * @interface
 * @description {interface} 管理权限，参数为token, id, newLevel
 * @param {String} token
 * @param {String} id 所修改的管理员id
 * @param {String} newLevel 新级别
 * @return {JSON} 成功 {errCode} 登陆失败 {errCode}
 */
exports.manage = function(req, res, next) {
    var data = req.body;
    if (!data.token || !data.id || !data.newLevel) {
        res.json({
            errCode: 108 //请求错误
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

/**
 * @interface
 * @description {interface} 修改管理员信息，参数为token, email, pass
 * @param {String} token
 * @param {String} pass 修改的密码
 * @param {String} email 修改的邮箱
 * @return {JSON} 成功 {errCode} 登陆失败 {errCode}
 */
exports.modify = function(req, res, next) {
    var data = req.body;
    if (!data.token || !data.email || !data.pass) {
        res.json({
            errCode: 108 //请求错误
        });
        next(err);
    }
    var email = data.email;
    var password = data.pass;
    authenticate(data.token, function(err, result) {
        if (err) return next(err);
        if (result) {
            User.getById(data.id)
            .done(function(data) {
                User.updateInfo(data, email, password, function(err) {
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

/**
 * @interface
 * @description {interface} 首页信息，参数为token
 * @param {String} token
 * @return {JSON} 成功 {errCode, 很多信息} 登陆失败 {errCode}
 */
exports.home = function(req, res, next) {
    var token = req.query.token;
    if (!token) {
        res.json({
            errCode: 108 //请求错误
        });
    }
    //与颁发的token作比较
    authenticate(token, function(err, result) {
        if (err) return next(err);
        if (result) {
            List.getHomeData()
            .done(function(data) {
                // console.log(data);
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
                    newBroadcastTimes: data.newBroadcastTimes,
                    downloadCount: data.downloadCount
                })
            })
        } else {
            res.json({
                errCode: 101 //令牌不存在或已经过期
            });
        }
    })
}

/**
 * @interface
 * @description {interface} 根据id获取用户信息，参数为token, id, tag
 * @param {String} token
 * @param {String} id 用户id
 * @param {String} tag tag= 1 : 车主用户; tag= 2 : 广告商用户
 * @return {JSON} 成功 {errCode, 很多信息, tag} 登陆失败 {errCode}
 */
exports.userDetailById = function(req, res, next) {
    var id = req.params.userid;
    var token = req.query.token;
    var tag = req.query.tag;
    console.log('token: ' + token);
    console.log('id: ' + id);
    console.log('tag: ' + tag);
    if (!id || !token || !tag) {
        res.json({
            errCode: 108 //请求错误
        });
        next(err);
    }

    //与颁发的token作比较
    authenticate(token, function(err, result) {
        if (err) return next(err);
        if (result) {
            if (tag == 1) {
                List.getUserById(id)
                .done(function(data) {
                    res.json({
                        errCode: 0,
                        tag: 1,
                        userDetail: data
                    });
                })
            } else if (tag == 2) {
                List.getAdvertiserById(id)
                .done(function(data) {
                    res.json({
                        errCode: 0,
                        tag: 2,
                        userDetail: data
                    });
                })
            }
        } else {
            res.json({
                errCode: 101 //令牌不存在或已经过期
            });
        }
    })
}

/**
 * @interface
 * @description {interface} 用户审核，参数为token, id, tag, success, reason
 * @param {String} token
 * @param {String} id 用户id
 * @param {String} tag tag= 1 : 车主用户; tag= 2 : 广告商用户
 * @param {String} success success= 1 : 审核通过; success= 0 : 审核未通过
 * @param {String} reason 未通过原因
 * @return {JSON} 成功 {errCode} 登陆失败 {errCode}
 */
exports.userVerify = function(req, res, next) {
  var data = req.body;
  var reason = data.reason || null;
  if (!data.token || !data.id) {
      res.json({
          errCode: 108 //请求错误
      });
      next(err);
  }
  authenticate(data.token, function(err, result) {
      if (err) return next(err);
      if (result) {
        var refMap = ['user', 'advertiser', 'administrator'];
        if (data.tag > 0 && (data.tag <= refMap.length)) {
        //   console.log(refMap[data.tag - 1] + ' | ' + data.id + ' | ' + data.success + ' | ' + reason);
          List.userVerify(refMap[data.tag - 1], data.id, data.tag, data.success, reason)
          .done(function() {
            res.json({
              errCode: 0
            })
          })
        } else {
            res.json({
                errCode: 108
            })
        }
      } else {
          res.json({
              errCode: 101 //令牌不存在或已经过期
          });
      }
  })
}

/**
 * @interface
 * @description {interface} 统计信息，参数为token
 * @param {String} token
 * @return {JSON} 成功 {errCode, 很多信息} 登陆失败 {errCode}
 */
exports.dayIncome = function(req, res, next) {
    var data = req.query;
    if (!data.token) {
        res.json({
            errCode: 108 //请求错误
        })
    }
    
    //与颁发的token作比较
    authenticate(data.token, function(err, result) {
        if (err) return next(err);
        if (result) {
            List.getStatistics()
            .done(function(data) {
                res.json({
                    errCode: 0,
                    statistics: data
                })
            })
        } else {
            res.json({
                errCode: 101 //令牌不存在或已经过期
            });
        }
    })
}

//***********jixiang: end ************
