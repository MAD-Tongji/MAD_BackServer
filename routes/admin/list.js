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
	console.log('id: ' + id);
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