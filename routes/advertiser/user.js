/**
 * Created by Teng on 2016/4/25.
 */

var memcached = require('memcached');
var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');

function login(){
    ref.child("advertiser").on("value", function(datasnapshot) {
        console.log(datasnapshot.val());
    });
}

function signup() {
    ref.child("advertiser").on("value", function(datasnapshot) {
        console.log(datasnapshot.val());
    });
}

exports.login = login;
exports.signup = signup;
