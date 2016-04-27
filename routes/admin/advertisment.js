var Q = require('q');
var Wilddog = require('wilddog');
var ref = new Wilddog("https://wild-boar-00060.wilddogio.com/");
var AdvertismentRef = ref.child("advertisment");


module.exports = Advertisment;

//广告管理接口的一些函数实现

function Advertisment(obj) {

}
//提交新广告
Advertisment.addNew = function (data, callback){
    var childref = AdvertismentRef.push({
    	//下面这个advertiser字段没传值，还不懂怎么获得。
    "advertiser": "admin"
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
    	//下面这个advertiser字段没传值，还不懂怎么获得。
    "advertiser": "admin"
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
}











