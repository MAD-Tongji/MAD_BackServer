var Q = require('q');
var Wilddog = require('wilddog');
var mongo = require('../../bin/mongo');
var publicUtils = require('../../lib/publicUtils');
var ref = new Wilddog("https://wild-boar-00060.wilddogio.com/");
var AdvertismentRef = ref.child("advertisment");
var AdvertiserRef = ref.child("advertiser");
var Message = require('./messages');


module.exports = Advertisment;

//广告管理接口的一些函数实现

//获取当前系统时间，格式：yyyy-MM-dd hh:mm:ss，这个函数是没统一规定使用momentjs前写的
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
	for (var key in obj) {

    	}
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
//传入参数为请求体

Advertisment.listAll = function (data){
	var deferred = Q.defer();
	var adsList = new Array();
	var listItem = new Advertisment();
	var list = [];
	console.log(data.tag);
	AdvertismentRef.limitToFirst(99999).on('value', function(snapshot){
		if(parseInt(data.tag) == parseInt(1)){
		  snapshot.forEach(function(snap){
		  	if(snap.child('status').val() == "100"){
		  		listItem.id = snap.ref().key();
		  		listItem.title = snap.child("title").val();
		  		listItem.catalog = snap.child("catalog").val();
		  		listItem.belongTo = snap.child("advertiser").val();
		  		list.push(listItem);
		  		adsList.push(snap.val());
		  		listItem = new Advertisment();
		  	}
		  })
		}
		else{
		  snapshot.forEach(function(snap){
		  		listItem.id = snap.ref().key();
		  		listItem.title = snap.child("title").val();
		  		listItem.catalog = snap.child("catalog").val();
		  		listItem.belongTo = snap.child("advertiser").val();
		  		list.push(listItem);
		  		adsList.push(snap.val());
		  		listItem = new Advertisment();
		  })
		}
		deferred.resolve(list);
	})
	return deferred.promise;

}

//审核广告
//传入参数为请求体
Advertisment.audit = function(data){
	var deferred = Q.defer();
	var AdsRef = AdvertismentRef.child(data.id);
	var Advertiser;
	AdsRef.child('advertiser').once('value', function(snapshot){
	Advertiser = snapshot.val();
});
	console.log(data.success);
	if(parseInt(data.success) == parseInt(0)){
		AdsRef.update({"status":"000"},function(err){
			console.log("00000");
			var content = "您的广告 [" + data.title + "] 未通过审核" + " 理由: " + data.reason;
			Message.sendMessage(Advertiser,2,content,function(err){
				deferred.resolve(err);
			});
			deferred.resolve(err);
		});
	}
	else if(parseInt(data.success) == parseInt(1)){
		AdsRef.update({"status":"001"},function(err){
			console.log("11111");
			var content = "您的广告 [" + data.title + "] 已通过审核";
			Message.sendMessage(Advertiser,2,content,function(err){
				deferred.resolve(err);
			})
			deferred.resolve(err);
		});
	}
	return deferred.promise;
}

//下架广告
//传入参数为请求体

Advertisment.remove = function(data){
	var deferred = Q.defer();
	var AdsRef = AdvertismentRef.child(data.id);
	var Advertiser;
	AdsRef.child('advertiser').once('value', function(snapshot){
	Advertiser = snapshot.val();
});
	AdsRef.update({"status":"101"},function(err){
		if(!err){
			if(Advertiser){
				var content = "您的广告 [" + data.title + "] 被下架了，原因是：" + data.reason;
				Message.sendMessage(Advertiser,2,content,function(err){
				deferred.resolve(err);
			});
		}else{
			deferred.resolve("Wrong Advertiser Id.");
		}
		}else{
			deferred.resolve(err);
		}
		});
	return deferred.promise;
}

//获取广告详情
//返回的字段未review，因为是调用朱哥的公共方法

Advertisment.detail = function(data){
	var deferred = Q.defer();
	deferred.resolve(publicUtils.getAdDetail(data.id));
	return deferred.promise;
}

//广告查询
//传入参数为请求体
//参数体中的broadcastLocation只能匹配与数据库存的相同的内容，是否应有个商圈和其对应的ID映射表？

Advertisment.search = function(data){
	var deferred = Q.defer();
	var item = new Advertisment();
	console.log("broadcastLocation:"+data.broadcastLocation);
	if(data.id){
		item.adId = data.id;
	}
	if(data.title){
		item.title = data.title;
	}
	if(data.broadcastLocation){
		item.broadcastLocation = data.broadcastLocation;
	}
	if(data.startDate){
		item.startDate = data.startDate;
	}
	if(data.endDate){
		item.endDate = data.endDate;
	}
	mongo.AdQuery(item,function callback(res){
		console.log(res);
		deferred.resolve(res);
	});
	return deferred.promise;
}









