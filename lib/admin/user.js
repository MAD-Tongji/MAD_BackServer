var crypto = require('crypto');
var expressJwt = require('express-jwt');
var memcached = require('memcached');
var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');

exports.login = function (req, res) {
	var data = req.body;
	authenticate(data.name, data.password, res);
}

function authenticate(name, pass, res) {
	ref.child("administrator/-KFwZRymhRyxR0UFGDAi").once("value", function(data) {
  		var username = data.val().name;
  		var password = data.val().password;
  		var hash = crypto.createHmac('sha256', pass)
                   .digest('hex');
        if (username == name && hash == password) {
        	res.json({
        		token: 'token',
        		errCode: 0
        	})
        } else {
        	res.json({
        		errCode: 104
        	})
        }
  	})
}