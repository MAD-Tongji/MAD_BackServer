var Q = require('q');
var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
var advertiserRef = ref.child("advertiser");
var carUserRef = ref.child("user");

module.exports = List;

function List(obj) {
  	for (var key in obj) {
    	this[key] = obj[key];
  	}
}

List.getUserIds = function() {
	var deferred = Q.defer();
    var ids = [];
    carUserRef.on("child_added", function(shapshot) {
        var id = shapshot.key();
        ids.push(id);
        deferred.resolve(ids);
    })
    return deferred.promise;
}

List.getCarUserList = function(ids) {
	var deferred = Q.defer();
    var listArr = [];
    if (ids) {
        for (var id in ids) {
            (function(id) {
                List.getCarUser(ids[id])
                .done(function(data) {
                    listArr.push(data.toJSON());
                    deferred.resolve(listArr);
                })
            })(id);
        }
    }
    return deferred.promise;
}

List.getCarUser = function(id) {
	var deferred = Q.defer();
    var list = new List();
    carUserRef.child(id).on("value", function(shapshot, err) {
    	if (err) deferred.reject(err);
        list.id = id;
        list.name = shapshot.val().name;
        list.status = shapshot.val().status;
        if (shapshot.val().detail) {
        	list.registrationDate = shapshot.val().detail.registerDate;
        } else {
        	list.registrationDate = 'null';
        }
    })
    deferred.resolve(list);
    return deferred.promise;
}

List.getAdvertiserIds = function() {
	var deferred = Q.defer();
    var ids = [];
    advertiserRef.on("child_added", function(shapshot) {
        var id = shapshot.key();
        ids.push(id);
        deferred.resolve(ids);
    })
    return deferred.promise;
}

List.getAdvertiserList = function(ids) {
	var deferred = Q.defer();
    var listArr = [];
    if (ids) {
        for (var id in ids) {
            (function(id) {
                List.getAdvertiser(ids[id])
                .done(function(data) {
                    listArr.push(data.toJSON());
                    deferred.resolve(listArr);
                })
            })(id);
        }
    }
    return deferred.promise;
}

List.getAdvertiser = function(id) {
	var deferred = Q.defer();
    var list = new List();
    advertiserRef.child(id).on("value", function(shapshot, err) {
    	if (err) deferred.reject(err);
        list.id = id;
        list.name = shapshot.val().name;
        list.status = shapshot.val().status;
        if (shapshot.val().detail) {
        	list.registrationDate = shapshot.val().detail.registerDate;
        } else {
        	list.registrationDate = 'null';
        }
    	deferred.resolve(list);
    })
    return deferred.promise;
}

List.getHomeData = function() {
	var deferred = Q.defer();
	var backendStatistics = new Object();
	ref.child("backendStatistics").once("value", function(shapshot, err) {
		if (err) deferred.reject(err);
		var data = shapshot.val();
		console.log('totalAdvertiser: ' + data.totalAdvertiser);
		backendStatistics.totalAdvertiser = data.totalAdvertiser;
		backendStatistics.totalAdvertisement = data.totalAdvertisement;
		backendStatistics.totalUser = data.totalUser;
		backendStatistics.totalBroadcastTimes = data.totalBroadcastTimes;
		backendStatistics.newUser = data.newUser;
		backendStatistics.newAdvertiser = data.newAdvertiser;
		backendStatistics.newAdvertisement = data.newAdvertisement;
		backendStatistics.newBroadcastTimes = data.newBroadcastTimes;
		List.getAllId('backendStatistics', 'totalStatistics')
		.done(function(data) {
			List.getAdvert_detail7(data)
			.done(function(data) {
				backendStatistics.advert_detail7 = data;
			})
		})
		List.getAllId('backendStatistics', 'topAdvertisements')
		.done(function(data) {
			List.getAdvertismentById(data)
			.done(function(data) {
				backendStatistics.advert_most = data;
			})
		})
		deferred.resolve(backendStatistics);
	})
	return deferred.promise;
}

List.getAdvert_detail7 = function(ids) {
	var deferred = Q.defer();
    var listArr = [];
    if (ids) {
        for (var id in ids) {
            (function(id) {
                List.getAdvert_detail(ids[id])
                .done(function(data) {
                    listArr.push(data);
                    deferred.resolve(listArr);
                })
            })(id);
        }
    }
    return deferred.promise;
}

List.getAdvert_detail = function(id){
  	var deferred = Q.defer();
    var advert_detail = new Object();
    ref.child("backendStatistics").child("totalStatistics").child(id).on("value", function(shapshot, err) {
    	if (err) deferred.reject(err);
        advert_detail.date = shapshot.val().date;
        advert_detail.totalBroadcastTimes = shapshot.val().totalBroadcastTimes;
        advert_detail.totalIncome = shapshot.val().totalIncome;
    })
    deferred.resolve(advert_detail);
    return deferred.promise;
}

List.getAdvertismentById = function(ids) {
	var deferred = Q.defer();
    var listArr = [];
    if (ids) {
        for (var id in ids) {
            (function(id) {
                List.getAdvertisment(ids[id])
                .done(function(data) {
                    listArr.push(data);
                    deferred.resolve(listArr);
                })
            })(id);
        }
    }
    return deferred.promise;
}

List.getAdvertisment = function(id) {
	var deferred = Q.defer();
    var advertisment = new Object();
    ref.child("advertisment").child(id).once("value", function(shapshot, err) {
    	if (err) deferred.reject(err);
        advertisment.id = id;
        if (shapshot.val().broadcastSum) {
        	advertisment.broadcastSum = shapshot.val().broadcastSum;
        } else {
        	advertisment.broadcastSum = 0;
        }
        advertisment.title = shapshot.val().title;
    })
    deferred.resolve(advertisment);
    return deferred.promise;
}

List.getAllId = function(relativeRef, childRef) {
	var deferred = Q.defer();
	var ids = [];
	ref.child(relativeRef).child(childRef).once("child_added", function(shapshot, err) {
		if (err) deferred.reject(err);
		var id = shapshot.key();
        ids.push(id);
        deferred.resolve(ids);
	});
	return deferred.promise;
}

List.prototype.toJSON = function() {
	return {
		id: this.id,
		name: this.name,
		status: this.status,
    registrationDate: this.registrationDate
	}
}

List.getAdvertiserById = function(id) {
	var deferred = Q.defer();
	var userDetail = new Object();
	var list = new List();
	advertiserRef.child(id).once("value", function(shapshot, err) {
		if (err) deferred.reject(err);
		var data = shapshot.val();
		list.name = data.name,
		list.id = id;
		list.status = data.status,
		list.email = data.email,
		List.getAdvertiserDetail(id)
		.done(function(data) {
			list.detail = data;
		})
		deferred.resolve(list);
	})
	return deferred.promise;
}

List.getAdvertiserDetail = function(id) {
	var deferred = Q.defer();
	var detail = new Object();
	advertiserRef.child(id).child("detail").once("value", function(shapshot, err) {
		if (err) deferred.reject(err);
		var data = shapshot.val();
        detail.registerDate = data.registerDate;
        detail.type = data.type;
        detail.licenseType = data.licenseType;
        detail.licenseImage = data.licenseImage;
        detail.licenseCode = data.licenseCode;
        detail.location = data.location;
        detail.accomodation = detail.accomodation;
        detail.businessScope = detail.businessScope;
        detail.businessPeriod = detail.businessPeriod;
        detail.organizationCode = detail.organizationCode;
        List.getAdvertiserLegalPerson(id)
        .done(function(data) {
            detail.legalPerson = data;
        })
        deferred.resolve(detail);
	})
    return deferred.promise;
}

List.getAdvertiserLegalPerson = function(id) {
    var deferred = Q.defer();
    var legalPerson = new Object();
    advertiserRef.child(id).child("detail").child("legalPerson").once("value", function(shapshot, err) {
        if (err) deferred.reject(err);
        var data = shapshot.val();
        legalPerson.name = data.name;
        legalPerson.location = data.location;
        legalPerson.id = data.id;
        legalPerson.validDate = data.validDate;
        legalPerson.ifLongTerm = data.ifLongTerm;
        legalPerson.ifLegalPerson = data.ifLegalPerson;
        deferred.resolve(legalPerson);
    })
    return deferred.promise;
}

List.getUserById = function(id) {
  var deferred = Q.defer();
  var userDetail = new Object();
  carUserRef.child(id).once("value", function(shapshot, err) {
    if (err) deferred.reject(err);
    var data = shapshot.val();
    userDetail.name = data.name;
    userDetail.id = id;
    userDetail.location = data.location;  //数据库缺字段
    userDetail.mobilePhone = data.mobilePhone;
    List.getUserDetail(id)
    .done(function(data) {
      userDetail.vehicleLicenseImage = data.vehicleLicenseImage;
      userDetail.email = data.email;
    })
    deferred.resolve(userDetail);
  })
  return deferred.promise;
}

List.getUserDetail = function(id) {
  var deferred = Q.defer();
  var detail = new Object();
  carUserRef.child(id).child("detail", function(shapshot, err) {
    if (err) deferred.reject(err);
    var data = shapshot.val();
    detail.vehicleLicenseImage = data.vehicleLicenseImage;
    detail.email = data.email;
    deferred.resolve(detail);
  })
  return deferred.promise;
}

List.userVerify = function(childRef, id, success, reason) {
  var deferred = Q.defer();
  var statusMap = [false, true];
  if (!childRef && !id) {
    if (success == 0 || success == 1) {
      ref.child(childRef).child(id).update({
        status: statusMap[success],
        reason: statusMap?null:reason
      }, function(err) {
        deferred.reject(err);
      })
      // console.log('childRef: ' + childRef);
      // console.log('id: ' + id)
      // console.log('status: ' + statusMap[success]);
      // console.log('reason: ' + statusMap?null:reason)
    }
    deferred.resolve('0');
  }
  return deferred.promise;
}

List.userCreate = function(username, userType, userEmail, initPassword) {
  var deferred = Q.defer();
  /* 接口信息不完整 */
}
