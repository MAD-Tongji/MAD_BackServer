var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
var moment = require('moment');

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
 * @param {String} tag tag= 1 : 车主用户; tag= 2 : 广告商用户; tag= 3 : 后台管理员
 * @param {String} content 消息内容
 * @param {function} fn 回调函数: 处理错误
 */
Message.sendMessage = function (id, tag, content, fn) {
    var refMap = ['user', 'advertiser'];
    if (tag > 0 && (tag <= refMap.length)) {
        ref.child(refMap[tag - 1]).child(id).child("message").push({
            content: content,
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
        }, function(err) {
            if (err) fn(err);
        })
    } else {
        fn(1);
    }
    fn(null);
}

/**
 * @function
 * @description {function} 发送消息，参数为id, tag, content, status, fn
 * @param {String} id 用户id
 * @param {String} tag tag= 1 : 车主用户; tag= 2 : 广告商用户; tag= 3 : 后台管理员
 * @param {String} content 消息内容
 * @param {function} fn 回调函数: 处理错误
 */
Message.sendBackMessage = function (id, content, status, fn) {
    if (id) {
        ref.child("administrator").child(id).child("message").push({
            content: content,
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            status: status //阅读状态 0 : 未阅读; 1 : 已阅读
        }, function(err) {
            if (err) fn(err);
        })
    } else {
        fn(1);
    }
    fn(null);
}