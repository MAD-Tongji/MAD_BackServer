var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
var moment = require('moment');
var advertiserRef = ref.child("advertiser");
var carUserRef = ref.child("user");

module.exports = Message;

function Message(obj) {
  	for (var key in obj) {
    	this[key] = obj[key];
  	}
}

/**
 * @function
 * @description {function} 发送消息，参数为id, tag, content, fn
 * @param {String} id 用户id
 * @param {String} tag tag= 1 : 车主用户; tag= 2 : 广告商用户
 * @param {String} content 消息内容
 * @fn 回调函数
 */
Message.sendMessage = function (id, tag, content, fn) {
    console.log(tag);
    if (tag == 1) {
        carUserRef.child(id).child("message").push({
            content: content,
            date: moment().format('YYYY-MM-DD HH:mm:ss')
        }, function(err) {
            if (err) fn(err);
        })
    } else if (tag == 2) {
        advertiserRef.child(id).child("message").push({
            content: content,
            date: moment().format('YYYY-MM-DD HH:mm:ss')
        }, function(err) {
            if (err) fn(err);
        })
    } else {
        fn(1);
    }
    fn(null);
}