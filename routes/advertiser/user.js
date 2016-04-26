/**
 * Created by Teng on 2016/4/25.
 */

var memcached = require('memcached');
var Q = require('q');
var wilddog = require('wilddog');
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
        }
        console.log(user);
        defer.resolve(user);
        //user["avatar"] = snapshot.val().avatar;  //数据库缺失,需要补
    });
    //defer.resolve(user);
    return defer.promise;
};

User.recharge = function(id, amount, alipay) {
    var defer = q.defer();
    var date = moment().format('YYYY-MM-DD hh:mm:ss');
    console.log(date);
    advertiserRef.child(id).child("recharge").push({
        account: alipay,
        amount: amount,
        status: "String",
        time: date
    });
    defer.resolve();
    return defer.promise;
};