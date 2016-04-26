/**
 * Created by Teng on 2016/4/25.
 */

var memcached = require('memcached');
var Q = require('q');
var wilddog = require('wilddog');
var Token = require('../../lib/publicUtils');
var advertiserRef = new wilddog('https://wild-boar-00060.wilddogio.com/advertiser');
var q = require('q');

module.exports = User;

function User(obj) {
  	for (var key in obj) {
    	this[key] = obj[key];
  	}
}


User.authenticate = function(email, pass, callback) {
	User.getAdvertiserByEmail(email).
	done(function(data, err) {
		console.log('advertiser data:')
		console.log(data);
		if (err) return callback(err);
		if (!data) return callback(err);
		if (pass === data.password) {
			callback(null, data);
		} else {
			callback(null, null);
		}
	});
};

User.getAdvertiserByEmail = function(email){
    var deferred = Q.defer();
	
	advertiserRef.orderByChild('email').equalTo(email).on('child_added', function (snapshot) {
		var user = snapshot.val();
		user.id = snapshot.key();
		deferred.resolve(user);
	});
    return deferred.promise;
};

User.createNewAdvertiser = function (info) {
	//先检查email是否重复
	
	//有重复email时返回errCode
	
	//没有重复时新建advertiser
	var newAdvertiser = advertiserRef.push({
		 //初始化数据
        Alipay: '',
        advertisment: {},
        balance: 0,
        currentBroadcast: 0,
        detail: {},
        email: info.email,
        expiration: "",
        message: {},
        name: info.username,
        password: info.password,
        recharge: {},
        refund: {},
        status: false,
        token: 'testtoken'
	});
	var newUser = {
		token: 'testtoken',
		id: newAdvertiser.key()
	};
	return newUser;
}


User.checkToken = function(token) {
    // 校验token，失败返回false
    return true;
}





/******** 我是分割线 **********/

function getAccountDetail(id) {
    var defer = q.defer();
    var user;
    advertiserRef.child(id).on("value", function(snapshot) {
        user = {
            name: snapshot.val().name,
            status: snapshot.val().status,
            email: snapshot.val().email,
            alipay: snapshot.val().Alipay
        }
        console.log(user);
        defer.resolve(user);
        //user["avatar"] = snapshot.val().avatar;  //数据库缺失,需要补
    });
    //defer.resolve(user);
    return defer.promise;
}

// 导出
exports.getAccountDetail = getAccountDetail;
