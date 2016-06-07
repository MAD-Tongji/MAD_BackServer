var Q = require('q');
var Wilddog = require('wilddog');
var publicUtils = require('../../lib/publicUtils');
var ref = new Wilddog("https://wild-boar-00060.wilddogio.com/");
var applyRef = ref.child("apply");
var User = require('./user');
var AdvertiserRef = ref.child("advertiser");
var UserRef = ref.child("user");
var Message = require('./messages');

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
					applyRef.child(data.applyId).once('value', function(snapshot){
						var id = snapshot.child("applyId").val();
						var userid = snapshot.child("userId").val();
						var money = snapshot.child("money").val();
						var catalog = snapshot.child("catalog").val();
						//更改广告商下的申请状态
						//申请通过后要做的事
						if(catalog == "2"){
						AdvertiserRef.child(userid).child("refund").child(id).update({"status": '11'});
						var msgContent = "您的退款申请(退款金额: "+money+" 元)已经通过审核。";
						Message.sendMessage(userid,2,msgContent, function(err){}); 

					}else if(catalog == "1"){
						AdvertiserRef.child(userid).child("recharge").child(id).update({"status": '11'});

						//充值成功，更新余额
						AdvertiserRef.child(userid).once('value', function(snapshot){
							var balance = snapshot.child("balance").val();
							var newBalance = balance + money;
							//AdvertiserRef.child(userid).child("refund").child(refId).update({"status": false});
						AdvertiserRef.child(userid).update({"balance": newBalance}, function(err){
							var msgContent = "您的充值申请(充值金额: "+money+" 元)已经通过审核。";
							Message.sendMessage(userid,2,msgContent, function(err){}); 							});	
						});

					}else if(catalog == "3"){
						var msgContent = "您的提现申请(退款金额: "+money+" 元)已经通过审核。";
						Message.sendMessage(userid,1,msgContent, function(err){}); 
					}


					});

				});
			}else{
				applyRef.child(data.applyId).update({"status":"00"},function(err){
					if(!err){				
						applyRef.child(data.applyId).once('value', function(snapshot){
							console.log(snapshot.child("money").val());
							var money = snapshot.child("money").val();
							var catalog = snapshot.child("catalog").val();
							var userid = snapshot.child("userId").val();
							var refId = snapshot.child("applyId").val();

							//申请被拒绝后要做的事
							if(catalog == "1"){
								AdvertiserRef.child(userid).child("recharge").child(refId).update({"status": '00'});
								var msgContent = "您的充值申请(充值金额: "+money+" 元)未能通过审核,原因：未收到钱款。";
								Message.sendMessage(userid,2,msgContent, function(err){});

							}
							else if(catalog == "2"){
							//console.log("222");
								AdvertiserRef.child(userid).once('value', function(snapshot){
									var balance = snapshot.child("balance").val();
									var newBalance = balance + money;
									AdvertiserRef.child(userid).child("refund").child(refId).update({"status": '00'});
									AdvertiserRef.child(userid).update({"balance": newBalance}, function(err){
									//deferred.resolve(err);
								});	
							});	
								var msgContent = "您的退款申请(退款金额: "+money+" 元)未能通过审核。";
								Message.sendMessage(userid,2,msgContent, function(err){}); 
						}
							else if(catalog == "3"){
								//console.log("333");
								var balance;
								UserRef.child(userid).once('value', function(snapshot){
									balance = snapshot.child("balance").val();
									var newBalance = balance + money;
									UserRef.child(userid).update({"balance": newBalance}, function(err){
									//deferred.resolve(err);
								});
							});	
								var msgContent = "您的提现申请(提现金额: "+money+" 元)未能通过审核。";
								Message.sendMessage(userid,1,msgContent, function(err){});						
						}

					});					
				}
					deferred.resolve(err);
				});
			}
		
	
	return deferred.promise;
}