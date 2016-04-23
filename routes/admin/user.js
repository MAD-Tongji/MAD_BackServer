var crypto = require('crypto');
var redis = require('redis'); //改用redis
var Token = require('../../lib/publicUtils');
// var memcached = require('memcached');
// var wilddog = require('wilddog');
// var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
var db = redis.createClient();

module.exports = User;

function User(obj) {
  	for (var key in obj) {
    	this[key] = obj[key];
  	}
}

User.prototype.save = function(fn){
  	if (this.id) {
    	this.update(fn);
  	} else {
    	var user = this;
    	db.incr('user:ids', function(err, id){
      		if (err) return fn(err);
      		user.id = id;
      		user.hashPassword(function(err){
        		if (err) return fn(err);
        		user.update(fn);
      		});
    	});
  	}
};

User.prototype.update = function(fn){
  	var user = this;
  	var id = user.id;
  	db.set('user:id:' + user.name, id, function(err) {
    	if (err) return fn(err);
    	db.hmset('user:' + id, user, function(err) {
      		fn(err);
    	});
  	});
};

User.prototype.hashPassword = function(fn){
  	var user = this;
  	var hash = crypto.createHash('sha256')
		.update(user.pass)
		.digest('hex');
  	user.pass = hash;
  	fn();
};

User.getByName = function(name, fn) {
	User.getId(name, function(err, id) {
		if (err) return fn(err);
		User.get(id, fn);
	})
}

User.getId = function(name, fn){
  	db.get('user:id:' + name, fn);
};

User.get = function(id, fn){
  	db.hgetall('user:' + id, function(err, user){
    	if (err) return fn(err);
    	fn(null, new User(user));
  	});
};

User.authenticate = function(name, pass, fn) {
	User.getByName(name, function(err, user) {
		if (err) return fn(err);
		if (!user.id) return fn();
		var hash = crypto.createHash('sha256')
			.update(pass)
			.digest('hex');
		if (hash == user.pass) return fn(null, user);
		fn();
	})
}

User.prototype.toJSON = function() {
	return {
		id: this.id,
		name: this.name
	}
}
/*初始化超级管理员admin，初始化后这段代码不再使用*/
// var admin = new User({
//   	name: 'admin',
//   	pass: '12345678',
//   	email: '12345678@admin.com',
//   	gender: 'male',
//   	level:  '1',
//   	direDate: new Date()
// });

// admin.save(function(err){
//   	if (err) throw err;
//   	console.log('user id: ' + admin.id + ' user password: ' + admin.pass);
// });


// exports.login = function (req, res) {
// 	var data = req.body;
// 	authenticate(data.name, data.password, res);
// }

// function authenticate(name, pass, res) {
// 	ref.child("administrator/-KFwZRymhRyxR0UFGDAi").once("value", function(data) {
//   		var username = data.val().name;
//   		var password = data.val().password;
//   		var hash = crypto.createHash('sha256')
//                 .update(pass)
//                 .digest('hex');
//       console.log(hash);
//         if (username == name && hash == password) {
//           var token = Token.getToken(username);
//         	res.json({
//         		token: token,
//         		errCode: 0
//         	})
//         } else {
//         	res.json({
//             hash: hash,
//         		errCode: 104
//         	})
//         }
//   	})
// }