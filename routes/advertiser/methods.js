var Q = require('q');
var User = require('./user');
var Token = require('../../lib/publicUtils');
























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
    if (token == 1) return fn(null, 1);
    fn();
}