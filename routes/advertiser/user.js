/**
 * Created by Teng on 2016/4/25.
 */

var memcached = require('memcached');
var Q = require('q');
var wilddog = require('wilddog');
var Token = require('../../lib/publicUtils');
var advertiserRef = new wilddog('https://wild-boar-00060.wilddogio.com/advertiser');
var adminRef = new wilddog('https://wild-boar-00060.wilddogio.com/administrator');
var q = require('q');
var moment = require('moment');

module.exports = User;

function User(obj) {
  	for (var key in obj) {
    	this[key] = obj[key];
  	}
}

/**
 * 验证user
 * @param email
 * @param pass
 * @param callback
 */
User.authenticate = function(email, pass, callback) {
	User.getAdvertiserByEmail(email).
        then(function(data) {
            // console.log('advertiser data:')
            // console.log(data);
            if (pass === data.password) {
                // 登陆后检查是否验证过
                if (!data.check) {
                    var uncheck = new Error('103');
                    callback(uncheck, null);
                } else {
                    callback(null, data);
                }
            } else {
                callback(null, null);
            }
        }, function(err) {
            callback(err);
        });
};

/**
 * 通过email获取用户
 * @param email
 * @returns {*|promise}
 */
User.getAdvertiserByEmail = function(email){
    var deferred = Q.defer();
    var targetEmail = formatEmail(email);
    advertiserRef.once('value', function (snapshot) {
        if (snapshot.child(targetEmail).exists()) {
            //用户存在，获取用户
            console.log('用户存在，获取用户');
            var user = snapshot.child(targetEmail).val();
            user.id = targetEmail;
            deferred.resolve(user);
        } else {
            //用户不存在
            console.log('用户不存在');
            var noUserError = new Error('102');
            deferred.reject('102');
        }
    });

    return deferred.promise;
};

/**
 * 激活用户
 * @param id
 */
User.checkUser = function (id) {
    // 根据ID获取用户，修改其check为true
    advertiserRef.child(id).update({
        check: true
    });
};

/**
 * 新建用户
 * @param info
 * @param callback
 */
User.createNewAdvertiser = function (info, callback) {
	User.getAdvertiserByEmail(info.email).
        then(function (data) {
            console.log('用户存在不能新建用户');
            callback(null);
        }, function (err) {
            // 用户不存在，新建广告商用户
            console.log(err);
            
            var targetEmail = formatEmail(info.email);
            var registerDate = moment().format('YYYY-MM-DD HH:mm:ss');
            console.log(registerDate);
            
            advertiserRef.child(targetEmail).set({
                //初始化数据
                Alipay: '',
                registerDate: registerDate,
                advertisment: {},
                balance: 0,
                currentBroadcast: 0,
                detail: {},
                email: info.email,
                message: {},
                name: info.username,
                password: info.password,
                recharge: {},
                refund: {},
                status: false,
                check: false
            });

            console.log(targetEmail);
            callback(targetEmail);
        });
};

/**
 * 检查token
 * @param token
 * @returns {boolean}
 */
User.checkToken = function(token) {
    // 校验token，失败返回false
    if (Token.token2id(token) !== null) {
        return true;
    } else {
        return false;
    }
};

function formatEmail(email) {
    return email.replace('.', '-');
}

/**
 * 获取用户信息
 * @param id
 * @returns {*}
 */

User.getAccountDetail = function(id) {
    var defer = q.defer();
    var user;
    advertiserRef.child(id).once("value", function(snapshot) {
        user = {
            name: snapshot.val().name,
            status: snapshot.val().status,
            email: snapshot.val().email,
            alipay: snapshot.val().Alipay,
            balance: snapshot.val().balance
        };
        //console.log(user);
        defer.resolve(user);
        //user["avatar"] = snapshot.val().avatar;  //数据库缺失,需要补
    });
    return defer.promise;
};

/**
 * 充值
 * @param id
 * @param amount
 * @param alipay
 * @returns {*}
 */
User.recharge = function(id, amount, alipay, callback) {
    var date = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(date);
    var newApply = advertiserRef.child(id).child("recharge").push({
        account: alipay,
        amount: amount,
        status: false, // false为到帐中,true为已到账
        time: date
    },function(err){
        callback(err,newApply.key());
    });
};

/**
 * 充值记录
 * @param id
 * @returns {*}
 */
User.getRechargeList = function (id) {
    var defer = q.defer();
    var list;
    advertiserRef.child(id).once("value",function(snapshot) {
        list = snapshot.val().recharge;
        console.log(list);
        defer.resolve(list);
    });
    return defer.promise;
};

/**
 * 添加退款记录
 * @param id
 * @param amount
 * @param alipay
 * @returns {*}
 */
User.refund = function(id, amount, alipay, callback) {
    var date = moment().format('YYYY-MM-DD HH:mm:ss');
    var newApply = advertiserRef.child(id).child('refund').push({
        account: alipay,
        amount: amount,
        status: false, // false为审核中,true为已退款
        time: date
    },function(err){
        callback(err,newApply.key());
    });
};

/**
 * 检查能否退款,并扣款
 * @param id
 * @param amount
 * @returns {*}
 */
User.refund.authenticate = function(id, amount) {
    var defer = q.defer();
    advertiserRef.child(id).once("value", function(snapshot) {
        var balance = snapshot.val().balance;
        console.log("balance: " + balance);
        console.log("amount: " + amount);
        if (amount > balance) {
            // 这里的处理有点问题
            defer.reject('304');
        } else {
            var newBalance = balance-amount;
            console.log("newBalance:" + newBalance);
            advertiserRef.child(id).update({
                balance: newBalance
            });
            defer.resolve();
        }
    });
    return defer.promise;
};

/**
 * 获取退款记录
 * @param id
 * @returns {*}
 */
User.getRefundList = function (id) {
    var defer = q.defer();
    var list;
    advertiserRef.child(id).once("value",function(snapshot) {
        list = snapshot.val().refund;
        console.log(list);
        defer.resolve(list);
    });
    return defer.promise;
};

/**
 * 获取消息列表
 * @param id
 * @returns {*}
 */
User.getMessages = function (id) {
    var defer = q.defer();
    var list;
    advertiserRef.child(id).once("value", function(snapshot) {
        list = snapshot.val().message;
        console.log(list);
        defer.resolve(list);
    });
    return defer.promise;
};

/**
 * 验证帐户
 * @param data
 * @returns {*}
 */
User.checkAccount = function (data, id) {
    var defer = q.defer();
    if (data && id) {
        advertiserRef.child(id).update({
            detail: data
        });
        defer.resolve();
    } else {
        var err = new Error('302');
        defer.reject(err);
    }
    
    return defer.promise;
};

/**
 * 用户保存草稿时,添加映射
 * @param userType
 * @param userId
 * @param advertId
 */
User.saveAdvert = function (userType, userId, advertId) {
    // 在用户的表里添加映射
    if (userType === "advertiser") {
        var advertiser = advertiserRef.child(userId);
        advertiser.once("value", function (snapshot) {
            // 如果节点不存在则添加节点
            if(!snapshot.child("advertisement").exists()) {
                advertiser.update({
                    advertisement: {
                        0: {
                            id: advertId
                        }
                    }
                });
            } else {
                // 添加id映射
                advertiser.child("advertisement").push({
                    id: advertId
                });
            }
        })
    } else if (userType === "admin") {
        var admin = adminRef.child(userId);
        admin.once("value", function (snapshot) {
            // 如果节点不存在则添加节点
            if(!snapshot.child("advertisement").exists()) {
                advertiser.update({
                    advertisement: null
                });
            }
            // 添加id映射
            advertiser.child("advertisement").push({
                id: advertId
            });
        })
    } else {
        console.log("用户类型不存在");
    }
};