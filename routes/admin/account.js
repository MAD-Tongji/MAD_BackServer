var Q = require('q');
var Wilddog = require('wilddog');
var publicUtils = require('../../lib/publicUtils');
var ref = new Wilddog("https://wild-boar-00060.wilddogio.com/");
var applyRef = ref.child("apply");
var User = require('./user');
var AdvertiserRef = ref.child("advertiser");
var UserRef = ref.child("user");

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
			    listItem = new Account();//???
		}
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
			    listItem = new Account();//???
		}
		
		})
		deferred.resolve(list);
	})
	return deferred.promise;
}

//完成申请
Account.complete = function(data){
	var deferred = Q.defer();	
			if (data.tag == 1) {
				applyRef.child(data.applyId).update({"status":"11"},function(err){
					deferred.resolve(err);
				});
			}else{
				applyRef.child(data.applyId).update({"status":"00"},function(err){
					if(!err){				
						applyRef.child(data.applyId).once('value', function(snapshot){
							console.log(snapshot.child("money").val());
							var money = snapshot.child("money").val();
							var catalog = snapshot.child("catalog").val();
							var userid = snapshot.child("userId").val();
							console.log(catalog);
							if(catalog == "2"){
							console.log("222");
								AdvertiserRef.child(userid).once('value', function(snapshot){
									var balance = snapshot.child("balance").val();
									var newBalance = balance + money;
									AdvertiserRef.child(userid).update({"balance": newBalance}, function(err){
									//deferred.resolve(err);
								});
							});	
						}
							else if(catalog == "3"){
								console.log("333");
								var balance;
								UserRef.child(userid).once('value', function(snapshot){
									balance = snapshot.child("balance").val();
									var newBalance = balance + money;
									UserRef.child(userid).update({"balance": newBalance}, function(err){
									//deferred.resolve(err);
								});
							});							
						}
					});					
				}
					deferred.resolve(err);
				});
			}
		
	
	return deferred.promise;
}