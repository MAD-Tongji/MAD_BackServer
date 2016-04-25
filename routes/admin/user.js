var crypto = require('crypto');
var redis = require('redis'); //改用redis
var Token = require('../../lib/publicUtils');
var Q = require('q');
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
      		})
    	})
  	}
}

User.prototype.update = function(fn){
  	var user = this;
  	var id = user.id;
  	db.set('user:id:' + user.name, id, function(err) {
    	if (err) return fn(err);
    	db.hmset('user:' + id, user, function(err) {
      		fn(err);
    	})
  	})
}

User.prototype.hashPassword = function(fn){
  	var user = this;
  	var hash = crypto.createHash('sha256')
		.update(user.pass)
		.digest('hex');
  	user.pass = hash;
  	fn();
}

User.getByName = function(name) {
	var deferred = Q.defer();
    User.getAllId(function(err, id) {
    	if (err) deferred.reject(err);
    	if (id) {
        for (var i = parseInt(id); i > 0; i--) {
            (function(i) {
                User.get(i.toString(), function(err, user) {
                    if (err) return err;
                    if (user.name == name) {
                    	deferred.resolve(user);
                    }
                    
                })
            })(i);
        }
    }
    })
    return deferred.promise;	
}

User.getId = function(name, fn){
  	db.get('user:id:' + name, fn);
}

User.getAllId = function(fn) {
	db.get('user:ids',fn);
}

User.get = function(id, fn){
  	db.hgetall('user:' + id, function(err, user){
    	if (err) return fn(err);
    	fn(null, new User(user));
  	})
}

User.authenticate = function(name, pass, fn) {
	User.getByName(name)
		.done(function(data, err) {
			if (err) return fn(err);
			if (!data.id) return fn(err);
			var hash = crypto.createHash('sha256')
				.update(pass)
				.digest('hex');
			if (hash == data.pass) return fn(null, data);
			fn();
		})
}

User.updateLevel = function(id, level, fn) {
	db.hset('user:' + id, 'level', level, function(err) {
		if (err) fn(err);
		fn(null);
	})
}

User.updateInfo = function(id, email, password, fn) {
	var hash = crypto.createHash('sha256')
		.update(password)
		.digest('hex');
	db.hset('user:' + id, 'pass', hash, function(err) {
		if (err) fn(err);
		fn(null);
	})
}

User.prototype.toJSON = function() {
	return {
		id: this.id,
		name: this.name,
		gender: this.gender,
        email: this.email,
        level: this.level,
        hireDate: this.hireDate
	}
}
/*初始化超级管理员admin，初始化后这段代码不再使用*/
/*安装了redis的胖友, 如果数据库是空的, 但是想跑一下后台管理员的接口,
  可以取消下面这段代码的注释, run: node routes/admin/user, 
  去初始化超级管理员(就是往数据库里插了一条记录), 然后就可以跑后台接口了*/

// var admin = new User({
//   	name: 'admin',
//   	pass: '12345678',
//   	email: '12345678@admin.com',
//   	gender: 'male',
//   	level:  '1',
//   	hireDate: (new Date()).toString().substr(0, 24)
// });

// admin.save(function(err){
//   	if (err) throw err;
//   	console.log('user id: ' + admin.id + ' user password: ' + admin.pass);
// });