/**
 * Created by Teng on 2016/4/25.
 */

var memcached = require('memcached');
var Q = require('q');
var wilddog = require('wilddog');
var advertiserRef = new wilddog('https://wild-boar-00060.wilddogio.com/advertiser');

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

