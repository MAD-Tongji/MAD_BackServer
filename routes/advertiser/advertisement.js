/**
 * Created by Teng on 2016/4/25.
 */

var memcached = require('memcached');
var Q = require('q');
var wilddog = require('wilddog');
var advertisementRef = new wilddog('https://wild-boar-00060.wilddogio.com/advertisement');


module.exports = Advertisement;

function Advertisement(obj) {
  	for (var key in obj) {
    	this[key] = obj[key];
  	}
}

// 获取所有已发布广告
Advertisement.allReleasedAdvertisement = function(callback) {
	
};

// 获取投放商圈列表
Advertisement.district = function () {
	
};

