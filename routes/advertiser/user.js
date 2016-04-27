/**
 * Created by Teng on 2016/4/25.
 */

var memcached = require('memcached');
var Q = require('q');
var wilddog = require('wilddog');
var Token = require('../../lib/publicUtils');
var advertiserRef = new wilddog('https://wild-boar-00060.wilddogio.com/advertiser');
var q = require('q');
var moment = require('moment');

module.exports = User;

function User(obj) {
  	for (var key in obj) {
    	this[key] = obj[key];
  	}
}


User.authenticate = function(email, pass, callback) {
	User.getAdvertiserByEmail(email).
        then(function(data) {
            // console.log('advertiser data:')
            // console.log(data);
            if (pass === data.password) {
                callback(null, data);
            } else {
                callback(null, null);
            }
        }, function(err) {
            callback(err);
        });
};

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

User.createNewAdvertiser = function (info, callback) {
	User.getAdvertiserByEmail(info.email).
        then(function (data) {
            console.log('用户存在不能新建用户');
            callback(null);
        }, function (err) {
            // 用户不存在，新建广告商用户
            console.log(err);
            
            var targetEmail = formatEmail(info.email);
            var registerDate = moment().format('YYYY-MM-DD HH:mm:ss')
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
                status: false
            });

            console.log(targetEmail);
            callback(targetEmail);
        });
}


User.checkToken = function(token) {
    // 校验token，失败返回false
    return true;
}

function formatEmail(email) {
    return email.replace('.', '-');
}




/******** 我是分割线 **********/

User.getAccountDetail = function(id) {
    var defer = q.defer();
    var user;
    advertiserRef.child(id).on("value", function(snapshot) {
        user = {
            name: snapshot.val().name,
            status: snapshot.val().status,
            email: snapshot.val().email,
            alipay: snapshot.val().Alipay
        };
        //console.log(user);
        defer.resolve(user);
        //user["avatar"] = snapshot.val().avatar;  //数据库缺失,需要补
    });
    return defer.promise;
};

User.recharge = function(id, amount, alipay) {
    var defer = q.defer();
    var date = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(date);
    advertiserRef.child(id).child("recharge").push({
        account: alipay,
        amount: amount,
        status: false, // false为到帐中,true为已到账
        time: date
    });
    defer.resolve();
    return defer.promise;
};

User.getRechargeList = function (id) {
    var defer = q.defer();
    var list;
    advertiserRef.child(id).on("value",function(snapshot) {
        list = snapshot.val().recharge;
        console.log(list);
        defer.resolve(list);
    });
    return defer.promise;
};

User.refund = function(id, amount, alipay) {
    var defer = q.defer();
    var date = moment().format('YYYY-MM-DD HH:mm:ss');
    advertiserRef.child(id).child('refund').push({
        account: alipay,
        amount: amount,
        status: false, // false为审核中,true为已退款
        time: date
    });
    defer.resolve();
    return defer.promise;
};

User.refund.authenticate = function(id, amount) {
    var defer = q.defer();
    advertiserRef.child(id).on("value", function(snapshot) {
        var balance = snapshot.val().balance;
        console.log(balance);
        if (amount > balance) {
            // 这里的处理有点问题
            defer.reject('301');
        } else {
            defer.resolve();
        }
    });
    return defer.promise;
};

User.getRefundList = function (id) {
    var defer = q.defer();
    var list;
    advertiserRef.child(id).on("value",function(snapshot) {
        list = snapshot.val().refund;
        console.log(list);
        defer.resolve(list);
    });
    return defer.promise;
};

User.getMessages = function (id) {
    var defer = q.defer();
    var list;
    advertiserRef.child(id).on("value", function(snapshot) {
        list = snapshot.val().message;
        console.log(list);
        defer.resolve(list);
    });
    return defer.promise;
};