var crypto = require('crypto');
var memcached = require('memcached');
var wilddog = require('wilddog');
var Token = require('../../lib/publicUtils');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');

exports.login = function (req, res) {
	var data = req.body;
	authenticate(data.name, data.password, res);
}

function authenticate(name, pass, res) {
	ref.child("administrator/-KFwZRymhRyxR0UFGDAi").once("value", function(data) {
  		var username = data.val().name;
  		var password = data.val().password;
  		var hash = crypto.createHash('sha256')
                .update(pass)
                .digest('hex');
      console.log(hash);
        if (username == name && hash == password) {
          var token = Token.getToken(username);
        	res.json({
        		token: token,
        		errCode: 0
        	})
        } else {
        	res.json({
            hash: hash,
        		errCode: 104
        	})
        }
  	})
}