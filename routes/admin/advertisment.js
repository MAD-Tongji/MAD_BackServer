var Q = require('q');
var Wilddog = require('wilddog');
var publicUtils = require('../../lib/publicUtils');
var ref = new Wilddog("https://wild-boar-00060.wilddogio.com/");
var AdvertismentRef = ref.child("advertisment");
var AdvertiserRef = ref.child("advertiser");


module.exports = Advertisment;

//广告管理接口的一些函数实现

//获取当前系统时间，格式：yyyy-MM-dd hh:mm:ss
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
    return currentdate;
}

function Advertisment(obj) {

}
//提交新广告
Advertisment.addNew = function (data, callback){
    var childref = AdvertismentRef.push({
    	//下面这个advertiser字段暂定为admin，下同
    "advertiser": "admin",
    "title": data.title ,//广告标题
    "content": data.content ,//广告内容
    "catalog": data.catalog ,//广告类别
    "timePeriod": data.timePeriod,//广告发布时段(不需要date类型，因为是下拉框选的)
    "broadcastLocation": data.broadcastLocation,//投放地点商圈名
    "startDate": data.startDate, //广告开始投放日期
    "endDate": data.endDate, //广告停止投放日期
    "status": "001" //提交新广告
	},function(err){
		callback(err,childref.key());
	});
}

//广告存为草稿
Advertisment.saveDraft = function (data, callback){
    var childref = AdvertismentRef.push({
    "advertiser": "admin",
    "title": data.title ,//广告标题
    "content": data.content ,//广告内容
    "catalog": data.catalog ,//广告类别
    "timePeriod": data.timePeriod,//广告发布时段(不需要date类型，因为是下拉框选的)
    "broadcastLocation": data.broadcastLocation,//投放地点商圈名
    "startDate": data.startDate, //广告开始投放日期
    "endDate": data.endDate, //广告停止投放日期
    "status": "010"//存为草稿标志
	},function(err){
		callback(err,childref.key());
	});
}

//获取广告列表
Advertisment.listAll = function (data){
	var deferred = Q.defer();
	var adsList = new Array();
	console.log(data.tag);
	AdvertismentRef.on('value', function(snapshot){
		if(parseInt(data.tag) == parseInt(1)){
		  snapshot.forEach(function(snap){
		  	if(snap.child('status').val() == "100"){
		  		console.log("2");
		  		//deferred.resolve(snap.val());
		  		adsList.push(snap.val());
		  	}
		  })
		}
		else{
		  snapshot.forEach(function(snap){
		  		adsList.push(snap.val());
		  		//deferred.resolve(snap.val());
		  		//callback(adsList);
		  })
		}
	})
	 deferred.resolve(adsList);

	return deferred.promise;

}

//审核广告
Advertisment.audit = function(data){
	var deferred = Q.defer();
	var AdsRef = AdvertismentRef.child(data.id);

	if(parseInt(data.success) == parseInt(0)){
		AdsRef.update({"status":"000"},function(err){
			deferred.resolve(err);
		});
	}
	else if(parseInt(data.success) == parseInt(1)){
		AdsRef.update({"status":"001"},function(err){
			deferred.resolve(err);
		});
	}
	return deferred.promise;
}

//下架广告
Advertisment.remove = function(data){
	var deferred = Q.defer();
	var AdsRef = AdvertismentRef.child(data.id);
	AdsRef.update({"status":"101"},function(err){
			deferred.resolve(err);
		});
	AdsRef.child('advertiser').once('value', function(snapshot){
	if(snapshot.val() == "admin"){
		return deferred.promise
	}else{
		var advertiserName = snapshot.val();
		//console.log(advertiserName);
		AdvertiserRef.child(advertiserName).once('value', function(snapshot1){

		if(snapshot1.hasChild('message')){
			var msg = AdvertiserRef.child(advertiserName).child('message');
			msg.push({
				"content": data.reason,
				"date":  getNowFormatDate(),
			})
		}else{
			var msg = AdvertiserRef.child(advertiserName);
			msg.update({
				"message":"messageid"
			},function(err){
				msg.child('message').push({
				"content": data.reason,
				"date":  getNowFormatDate(),
			});

			})
		}
})
		return deferred.promise;
	}
})
	return deferred.promise;
}

Advertisment.detail = function(data){
	var deferred = Q.defer();
	deferred.resolve(publicUtils.getAdDetail(data.id));
	return deferred.promise;
}









