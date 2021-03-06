var Q = require('q');
var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
var advertiserRef = ref.child("advertiser");
var carUserRef = ref.child("user");
var adminStatisticRef = ref.child("statistic").child("admin");
var Message = require('./messages');

module.exports = List;

/**
 * 列表类构造函数
 */
function List(obj) {
  	for (var key in obj) {
    	this[key] = obj[key];
  	}
}

/**
 * 获取全部车主用户id
 */
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

/**
 * 根据[id]获取全部车主信息
 */
List.getCarUserList = function(ids) {
	var deferred = Q.defer();
    var listArr = [];
    if (ids) {
        for (var id in ids) {
            (function(id) {
                List.getCarUser(ids[id])
                .done(function(data) {
                    if (data != 'null') {
                        listArr.push(data.toJSON());
                        deferred.resolve(listArr);
                    }
                })
            })(id);
        }
    }
    return deferred.promise;
}

/**
 * 根据id获取对应车主信息
 */
List.getCarUser = function(id) {
	var deferred = Q.defer();
    var list = new List();
    carUserRef.child(id).once("value", function(shapshot, err) {
    	if (err) deferred.reject(err);
        if (shapshot.val().name && shapshot.val().name != 'undefined' && shapshot.val().detail && shapshot.val().detail != 'undefined') {
            list.id = id;
            list.name = shapshot.val().name;
            list.status = shapshot.val().status;
            if (shapshot.val().detail && shapshot.val().detail.registerDate) {
                list.registrationDate = shapshot.val().detail.registerDate;
            } else if (!shapshot.val().detail || !shapshot.val().detail.registerDate){
                list.registrationDate = 'null';
            }
            deferred.resolve(list);
        } else {
            deferred.resolve('null');
        }
    })
    return deferred.promise;
}

/**
 * 获取全部广告商用户id
 */
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

/**
 * 获取全部广告商用户信息
 */
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

/**
 * 根据id获取广告商全部信息
 */
List.getAdvertiser = function(id) {
	var deferred = Q.defer();
    var list = new List();
    advertiserRef.child(id).on("value", function(shapshot, err) {
    	if (err) deferred.reject(err);
        list.id = id;
        list.name = shapshot.val().name;
        list.status = shapshot.val().status;
        list.registrationDate = shapshot.val().registerDate;
    	deferred.resolve(list);
    })
    return deferred.promise;
}


/**
 * 获取首页数据
 */
List.getHomeData = function() {
	var deferred = Q.defer();
	var backendStatistics = new Object();
	adminStatisticRef.child("homePageData").once("value", function(shapshot, err) {
		if (err) deferred.reject(err);
        var data = shapshot.val();
        List.totalAdvertisement()
        .done(function(data) {
            adminStatisticRef.child("homePageData").update({
                totalAdvertisement: data.length
            }, function(err) {
                if (err) deferred.reject(err);
            })
        })
		List.totalAdvertiser()
        .done(function(data) {
            adminStatisticRef.child("homePageData").update({
                totalAdvertiser: data.length
            }, function(err) {
                if (err) deferred.reject(err);
            })
        })
        List.totalUser()
        .done(function(data) {
            adminStatisticRef.child("homePageData").update({
                totalUser: data.length
            }, function(err) {
                if (err) deferred.reject(err);
            })
        })
       
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

/**
 * 获取7天广告详情
 */
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

List.totalAdvertiser = function() {
    var deferred = Q.defer();
    var ids = [];
    advertiserRef.on("child_added", function(shapshot) {
        var id = shapshot.key();
        ids.push(id);
        deferred.resolve(ids);
    })
    return deferred.promise;
}

List.totalAdvertisement = function() {
    var deferred = Q.defer();
    var ids = [];
    ref.child("advertisment").limitToFirst(999999).on("child_added", function(shapshot) {
        var id = shapshot.key();
        ids.push(id);
        deferred.resolve(ids);
    })
    return deferred.promise;
}

List.totalUser = function() {
    var deferred = Q.defer();
    var ids = [];
    ref.child("user").on("child_added", function(shapshot) {
        var id = shapshot.key();
        ids.push(id);
        deferred.resolve(ids);
    })
    return deferred.promise;
}

/**
 * 广告详情Object->JSON
 */
List.toDetailJSON = function (data) {
    return {
        date: data.date,
        totalBroadcastTimes: data.totalBroadcastTimes,
        totalIncome: data.totalIncome
    }
}

/**
 * 根据id获取广告详情
 */
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

/**
 * 获取全部广告id
 */
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

/**
 * Obejct->JSON
 */
List.toAdJson = function (data) {
    return {
        advert_id: data.advert_id,
        broadcastSum: data.broadcastSum,
        title: data.title
    }
}

/**
 * 根据id获取投放最多的广告
 */
List.getAdvertisment = function(id) {
	var deferred = Q.defer();
    var advertisment = new Object();
    adminStatisticRef.child("homePageData").child("advert_most").child(id).once("value", function(shapshot, err) {
    	if (err) deferred.reject(err);
        advertisment.id = id;
        if (shapshot.val().broadcastTimes) {
        	advertisment.broadcastSum = shapshot.val().broadcastTimes;
        } else {
        	advertisment.broadcastSum = 0;
        }
        advertisment.title = shapshot.val().title;
    })
    deferred.resolve(advertisment);
    return deferred.promise;
}

/**
 * 获取全部id
 */
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
/**
 * Onject->JSON
 */
List.prototype.toJSON = function() {
	return {
		id: this.id,
		name: this.name,
		status: this.status,
        registrationDate: this.registrationDate
	}
}

/**
 * 获取最近7周APP下载量
 */
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

/**
 * Object->JSON
 */
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

/**
 * 根据id获取广告商信息
 */
List.getAdvertiserById = function(id) {
	var deferred = Q.defer();
	var userDetail = new Object();
	advertiserRef.child(id).once("value", function(shapshot, err) {
		if (err) deferred.reject(err);
		var data = shapshot.val();
		userDetail.name = data.name;
		userDetail.id = id;
		userDetail.status = data.status;
		userDetail.email = data.email;
        userDetail.registerDate = data.registerDate;
		List.getAdvertiserDetail(id)
		.done(function(data) {
			userDetail.detail = data;
		})
		deferred.resolve(userDetail);
	})
	return deferred.promise;
}

/**
 * 根据id获取广告商基本信息
 */
List.getAdvertiserDetail = function(id) {
	var deferred = Q.defer();
	var detail = new Object();
	advertiserRef.child(id).child("detail").once("value", function(shapshot, err) {
        if (err) {
            deferred.reject(err);
        }
		if (!shapshot.val()) {
            detail.type = 'null';
            detail.licenseType = 'null';
            detail.licenseImage = 'null';
            detail.licenseCode = 'null';
            detail.location = 'null';
            detail.accomodation = 'null';
            detail.businessScope = 'null';
            detail.businessPeriod = 'null';
            detail.organizationCode = 'null';
        }
        else {
            var data = shapshot.val();
            // detail.registerDate = data.registerDate;
            detail.type = data.type;
            detail.licenseType = data.licenseType;
            detail.licenseImage = data.licenseImage;
            detail.licenseCode = data.licenseCode;
            detail.location = data.location;
            detail.accomodation = data.accomodation;
            detail.businessScope = data.businessScope;
            detail.businessPeriod = data.businessPeriod;
            detail.organizationCode = data.organizationCode;
        }
        List.getAdvertiserLegalPerson(id)
        .done(function(data) {
            detail.legalPerson = data;
        })
        deferred.resolve(detail);
	})
    return deferred.promise;
}

/**
 * 根据id获取广告商法人信息
 */
List.getAdvertiserLegalPerson = function(id) {
    var deferred = Q.defer();
    var legalPerson = new Object();
    advertiserRef.child(id).child("detail").child("legalPerson").once("value", function(shapshot, err) {
        if (err) {
            deferred.reject(err);
        }
        if (!shapshot.val()) {
            legalPerson.name = 'null';
            legalPerson.location = 'null';
            legalPerson.id = 'null';
            legalPerson.validDate = 'null';
            legalPerson.ifLongTerm = 'null';
            legalPerson.ifLegalPerson = 'null';
        }
        else {
            var data = shapshot.val();
            legalPerson.name = data.name;
            legalPerson.location = data.location;
            legalPerson.id = data.id;
            legalPerson.validDate = data.validDate;
            legalPerson.ifLongTerm = data.ifLongTerm;
            legalPerson.ifLegalPerson = data.iflegalperson;
        }
        deferred.resolve(legalPerson);
    })
    return deferred.promise;
}

/**
 * 根据id获取车主信息
 */
List.getUserById = function(id) {
  var deferred = Q.defer();
  var userDetail = new Object();
  carUserRef.child(id).once("value", function(shapshot, err) {
    if (err) deferred.reject(err);
    var data = shapshot.val();
    userDetail.name = data.name;
    userDetail.id = id;
    if (data.location) {
        userDetail.location = data.location;
    } else {
        userDetail.location = 'null';
    }
    
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

/**
 * 车主基本信息
 */
List.getUserDetail = function(id) {
  var deferred = Q.defer();
  var detail = new Object();
  carUserRef.child(id).child("detail").once("value", function(shapshot, err) {
    if (err) deferred.reject(err);
    if (!shapshot.val()) {
        detail.vehicleLicenseImage = 'null';
        detail.email = 'null';
    }
    else {
        var data = shapshot.val();
        detail.vehicleLicenseImage = data.vehicleLicenseImage;
        detail.email = data.email;
    }
    deferred.resolve(detail);
  })
  return deferred.promise;
}

/**
 * 审核用户
 */
List.userVerify = function(childRef, id, tag, success, reason) {
    var deferred = Q.defer();
    var statusMap = ['001', '100'];
    if (childRef && id) {
        if (success == 0 || success == 1) {
            ref.child(childRef).child(id).update({
                status: statusMap[success]
            }, function(err) {
                deferred.reject(err);
            })
            if (success == 0) reason = "抱歉您的申请没有通过!原因: " + reason;
            if (success == 1) reason = "恭喜您通过审核!";
            var title = "审核消息";
            Message.sendMessage(id, tag, reason, function(err) {
                if (err) deferred.reject(err); 
                deferred.resolve();
            })
        }
    }
    return deferred.promise;
}

/**
 * 数据统计
 */
List.getStatistics = function() {
    var deferred = Q.defer();
    var listArr = [];
    adminStatisticRef.child("incomeDate").on("child_added", function(shapshot, err) {
        if (err) deferred.reject(err);
        var id = shapshot.key();
        // console.log(shapshot.key());
        adminStatisticRef.child("incomeDate").child(id).once("value", function(shapshot, err) {
            if (err) deferred.reject(err);
            listArr.push({
                date: id,
                totalBroadcast: shapshot.val().totalBroadcastTimes,
                totalIncome: shapshot.val().totalIncome
            })
            deferred.resolve(listArr);
        })
    })
    return deferred.promise;
}
