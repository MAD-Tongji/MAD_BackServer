/**
 * Created by Teng on 2016/4/25.
 */

var memcached = require('memcached');
var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');

function a(){
    console.log('a');//logic
}
function b(callback) {
    console.log('b');//logic
    callback();//callback with no parms
    //or callback(parm1,parm2,......)
}

exports.a = a;//export
exports.b = b;//export