/**
 * Created by Teng on 2016/4/25.
 */

var memcached = require('memcached');
var Q = require('q');
var wilddog = require('wilddog');
var advertisementRef = new wilddog('https://wild-boar-00060.wilddogio.com/advertisment');
var cityRef = new wilddog('https://wild-boar-00060.wilddogio.com/AdsInCitys');

module.exports = Advertisement;

function Advertisement(obj) {
  	for (var key in obj) {
    	this[key] = obj[key];
  	}
}

// 获取所有已发布广告
Advertisement.getAllAdvertisement = function(id) {
	var defer = Q.defer();
	console.log(id);
	advertisementRef.orderByChild("advertiser").equalTo(id).on("value", function (snapshot) {
		defer.resolve(snapshot.val());
	});
	return defer.promise;
};

// 获取投放商圈列表
Advertisement.district = function (city) {
	var defer = Q.defer();
	var districts = new Array;
	cityRef.child(city).on("value", function (snapshot) {
		console.log(snapshot.val());
		snapshot.forEach(function (district) {
			districts.push(district.val().name);
		});
		console.log(districts);
		defer.resolve(districts);
	});
	return defer.promise;
};

Advertisement.submitAdvert = function (id, data, callback) {
	var newPush = advertisementRef.push({
		"advertiser": id,
		"title": data.title ,//广告标题
		"content": data.content ,//广告内容
		"catalog": data.catalog ,//广告类别
		"broadcastLocation": data.broadcastLocation,//投放地点商圈名
		"startDate": data.startDate, //广告开始投放日期
		"endDate": data.endDate, //广告停止投放日期
		"status": "001" //提交新广告
	},function(err){
		callback(err,newPush.key());
	});
};

Advertisement.saveAdvertisment = function () {
	
};

Advertisement.removeAdvertisment = function () {
	
};

Advertisement.getAdvertismentById = function () {
	
};