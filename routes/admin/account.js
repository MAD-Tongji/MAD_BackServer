var Q = require('q');
var Wilddog = require('wilddog');
var publicUtils = require('../../lib/publicUtils');
var ref = new Wilddog("https://wild-boar-00060.wilddogio.com/");
var applyRef = ref.child("apply");

module.exports = Account;
function Account(obj) {
	for (var key in obj) {
    	this[key] = obj[key];
  	}
}

//获取对账信息列表
Account.accountList = function(data){
	var deferred = Q.defer();
	var listItem = new Account();
	var list = [];
	applyRef.once('value', function(snapshot){
		snapshot.forEach(function(snap){
			if(snap.child("status").val() == "11" ){
				listItem.id = snap.ref().key();
				console.log(listItem.id);
				listItem.catalog = snap.child("catalog").val();
				listItem.userId = snap.child("userId").val();
				listItem.account = snap.child("account").val();
				listItem.money = snap.child("money").val();
				listItem.completedDate = snap.child("completedDate").val();
				listItem.operatorName = snap.child("operatorName").val();
				list.push(listItem);
			}
			listItem = new Account();//???
		})
		deferred.resolve(list);
	})
	return deferred.promise;
}

//获取申请列表信息
Account.applyList = function(data){
	var deferred = Q.defer();
	var listItem = new Account();
	var list = [];
	applyRef.once('value', function(snapshot){
		snapshot.forEach(function(snap){
			//console.log(data.catalog);
			if(snap.child("status").val() == "01" && snap.child("catalog").val() == data.catalog){
				listItem.id = snap.ref().key();
				listItem.userName = snap.child("userName").val();
				listItem.userId = snap.child("userId").val();
				listItem.account = snap.child("account").val();
				listItem.money = snap.child("money").val();
				listItem.applyDate = snap.child("applyDate").val();
				list.push(listItem);
			}
			listItem = new Account();//???
		
		})
		deferred.resolve(list);
	})
	return deferred.promise;
}

//完成申请
Account.complete = function(data){
	var deferred = Q.defer();
	//！！！！！！！暂时缺少验证登录密码的模块
	applyRef.child(data.applyId).update({"status":"11"},function(err){
		deferred.resolve(err);
	});
	return deferred.promise;
}