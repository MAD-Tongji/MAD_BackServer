var crypto = require('crypto');
var Token = require('../../lib/publicUtils');
var Q = require('q');
var memcached = require('memcached');
var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
var adminRef = ref.child("administrator");
var Message = require('./messages');

module.exports = User;

function User(obj) {
  	for (var key in obj) {
    	this[key] = obj[key];
  	}
}

User.prototype.save = function(fn){
  	var user = this;
    var newPush = adminRef.push({
        name: user.name,
        email: user.email,
        pass: user.pass,
        gender: user.gender,
        level: user.level,
        hireDate: user.hireDate
    }, function(err) {
        if (err) fn(err);
    })

    var id = newPush.key();
    user.hashPassword(user.pass, function(err, hashPass) {
        if (err) return fn(err);
        adminRef.child(id).update({
            id: id,
            pass: hashPass
        }, function(err) {
            if (err) fn(err);
            var tag = 3;
            var reason = "您被任命为系统管理员!"
            Message.sendMessage(id, tag, reason, function(err) {
                if (err) fn(err);
            })
        })
        fn(null);
    })
}

User.prototype.hashPassword = function(pass, fn){
  	var hash = crypto.createHash('sha256')
		.update(pass)
		.digest('hex');
  	fn(null, hash);
}

User.getId = function(name){
    var deferred = Q.defer();
    adminRef.on("child_added", function(shapshot) {
        var id = shapshot.key();
        adminRef.child(id).on("value", function(data) {
            if (data.val().name == name) {
                deferred.resolve(id);
            } 
        })
    })
    return deferred.promise;
}

User.getUser = function(id) {
    var deferred = Q.defer();
    var user = new User();
    adminRef.child(id).on("value", function(shapshot) {
        user.name = shapshot.val().name;
        user.pass = shapshot.val().pass;
        user.id = shapshot.val().id;
        deferred.resolve(user);
        console.log(user);
    })
    return deferred.promise;
}

User.getAllId = function() {
	var deferred = Q.defer();
    var ids = [];
    adminRef.on("child_added", function(shapshot) {
        var id = shapshot.key();
        ids.push(id);
        deferred.resolve(ids);
    })
    return deferred.promise;
}

User.get = function(id){
  	var deferred = Q.defer();
    var user = new User();
    adminRef.child(id).on("value", function(shapshot) {
        user.id = shapshot.val().id;
        user.name = shapshot.val().name;
        user.gender = shapshot.val().gender;
        user.email = shapshot.val().email;
        user.level = shapshot.val().level;
        user.hireDate = shapshot.val().shapshot;
    })
    deferred.resolve(user);
    return deferred.promise;
}

User.authenticate = function(name, pass, fn) {
	User.getId(name)
	.done(function(data, err) {
		if (err) return fn(err);
		if (!data) return fn(err);
        User.getUser(data)
        .done(function(data, err) {
            if (err) return fn(err);
            if (!data) return fn(err);
			var hash = crypto.createHash('sha256')
				.update(pass)
				.digest('hex');
			if (hash == data.pass) return fn(null, data);
			fn();
        })
	})
}

User.getById = function(userId) {
    var deferred = Q.defer();
    adminRef.on("child_added", function(shapshot) {
        var id = shapshot.key();
        adminRef.child(id).on("value", function(data) {
            if (data.val().id == userId) {
                deferred.resolve(id);
            } 
        })
    })
    return deferred.promise;
}

User.updateLevel = function(id, level, fn) {
    adminRef.child(id).update({
        level: level
    }, function(err) {
        if (err) fn(err);
        var tag = 3;
        var reason = "您的管理权限已被修改为" + level;
        Message.sendMessage(id, tag, reason, function(err) {
            if (err) fn(err);
        })
        fn(null);
    })
}

User.updateInfo = function(id, email, password, fn) {
	var hash = crypto.createHash('sha256')
		.update(password)
		.digest('hex');
    adminRef.child(id).update({
        email: email,
        pass: hash
    }, function(err) {
        if (err) fn(err);
        var tag = 3;
        var reason = "您的个人信息修改成功!";
        Message.sendMessage(id, tag, reason, function(err) {
            if (err) fn(err);
        })
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