var Q = require('q');
var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
var advertiserRef = ref.child("advertiser");
var carUserRef = ref.child("user");
var adminStatisticRef = ref.child("statistic").child("admin");

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
	adminStatisticRef.child("homePageData").once("value", function(shapshot, err) {
		if (err) deferred.reject(err);
		var data = shapshot.val();
		backendStatistics.totalAdvertiser = data.totalAdvertiser;
		backendStatistics.totalAdvertisement = data.totalAdvertisement;
		backendStatistics.totalUser = data.totalUser;
		backendStatistics.totalBroadcastTimes = data.totalBroadcastTimes;
		backendStatistics.newUser = data.newUser;
		backendStatistics.newAdvertiser = data.newAdvertiser;
		backendStatistics.newAdvertisement = data.newAdvertisement;
		backendStatistics.newBroadcastTimes = data.newBroadcastTimes;
		List.getAllId('homePageData', 'advert_detail7')
		.done(function(data) {
			List.getAdvert_detail7(data)
			.done(function(data) {
				backendStatistics.advert_detail7 = data;
			})
            List.getAllId('homePageData', 'advert_most')
            .done(function(data) {
                List.getAdvertismentById(data)
                .done(function(data) {
                    backendStatistics.advert_most = data;
                })
                List.getDownloadCount(data)
                .done(function(data) {
                    backendStatistics.downloadCount = data;
                    deferred.resolve(backendStatistics);
                })
            })
		})
		
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
                    listArr.push(List.toDetailJSON(data));
                    deferred.resolve(listArr);
                })
            })(id);
        }
    }
    return deferred.promise;
}

List.toDetailJSON = function (data) {
    return {
        date: data.date,
        totalBroadcastTimes: data.totalBroadcastTimes,
        totalIncome: data.totalIncome
    }
}

List.getAdvert_detail = function(id){
  	var deferred = Q.defer();
    var advert_detail = new Object();
    adminStatisticRef.child("homePageData").child("advert_detail7").child(id).once("value", function(shapshot, err) {
    	if (err) deferred.reject(err);
        advert_detail.date = id;
        advert_detail.totalBroadcastTimes = shapshot.val().totalBroadcastTimes;
        advert_detail.totalIncome = shapshot.val().totalIncome;
        deferred.resolve(advert_detail);
    })
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

List.toAdJson = function (data) {
    return {
        advert_id: data.advert_id,
        broadcastSum: data.broadcastSum,
        title: data.title
    }
}

List.getAdvertisment = function(id) {
	var deferred = Q.defer();
    var advertisment = new Object();
    adminStatisticRef.child("homePageData").child("advert_most").child(id).once("value", function(shapshot, err) {
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
	adminStatisticRef.child(relativeRef).child(childRef).on("child_added", function(shapshot, err) {
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

List.getDownloadCount = function() {
    var deferred = Q.defer();
    var downloadCount = new Object();
    adminStatisticRef.child("homePageData").child("downloadCount").once("value", function(shapshot, err) {
        if (err) deferred.reject(err);
        var data = shapshot.val();
        downloadCount.week1 = data[0];
        downloadCount.week2 = data[1];
        downloadCount.week3 = data[2];
        downloadCount.week4 = data[3];
        downloadCount.week5 = data[4];
        downloadCount.week6 = data[5];
        downloadCount.week7 = data[6];
        deferred.resolve(List.toDownloadJSON(downloadCount));
    });
    return deferred.promise;
}

List.toDownloadJSON = function (data) {
    return {
        week1: data.week1,
        week2: data.week2,
        week3: data.week3,
        week4: data.week4,
        week5: data.week5,
        week6: data.week6,
        week7: data.week7
    }
}

List.getAdvertiserById = function(id) {
	var deferred = Q.defer();
	var userDetail = new Object();
	advertiserRef.child(id).once("value", function(shapshot, err) {
		if (err) deferred.reject(err);
		var data = shapshot.val();
		userDetail.name = data.name,
		userDetail.id = id;
		userDetail.status = data.status,
		userDetail.email = data.email,
		List.getAdvertiserDetail(id)
		.done(function(data) {
			userDetail.detail = data;
		})
		deferred.resolve(userDetail);
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

List.getStatistics = function() {
    var deferred = Q.defer();
    var listArr = [];
    adminStatisticRef.child("incomeDate").on("child_added", function(shapshot, err) {
        if (err) deferred.reject(err);
        var id = shapshot.key();
        console.log(shapshot.key());
        adminStatisticRef.child("incomeDate").child(id).once("value", function(shapshot, err) {
            if (err) deferred.reject(err);
            listArr.push({
                totalBroadcast: shapshot.val().totalBroadcast,
                totalIncome: shapshot.val().totalIncome
            })
            deferred.resolve(listArr);
        })
    })
    return deferred.promise;
}
