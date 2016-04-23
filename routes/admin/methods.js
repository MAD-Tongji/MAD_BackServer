var url = require('url');
var User = require('./user');
var Token = require('../../lib/publicUtils');

exports.login = function(req, res, next){
    var data = req.body;
    User.authenticate(data.name, data.pass, function(err, user){
        if (err) return next(err);
        if (user) {
            var token = Token.getToken(user.name);
            res.json({
                token: token,
                errCode: 0
            })
        } else {
            res.json({
               errCode: 104 //用户名或密码不正确
            })
        }
    });
};

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
                //获取车主用户列表
                res.json({
                    errCode: 0,
                    userList: 'userList'
                });
            } else if (tag == 2) {
                //获取广告商用户列表
                res.json({
                    errCode: 0,
                    advertiserList: 'advertiserList'
                });
            }
        } else {
            res.json({
                errCode: 101 //令牌不存在或已经过期
            })
        }
    });
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
    // 获取token逻辑
    return fn(null, 1);
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
            res.json({
                errCode: 0,
                userList: 'backuserList'
            });
        } else {
            res.json({
                errCode: 101 //令牌不存在或已经过期
            })
        }
    });
}