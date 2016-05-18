/**
 * Created by Teng on 2016/5/18.
 */

var memcached = require('memcached');
var Q = require('q');
var wilddog = require('wilddog');
var statisticRef = new wilddog('https://wild-boar-00060.wilddogio.com/statistic');
// var cityRef = new wilddog('https://wild-boar-00060.wilddogio.com/AdsInCitys');

module.exports = Statistic;

function Statistic(obj) {
  	for (var key in obj) {
    	this[key] = obj[key];
  	}
}

Statistic.getAllStatistic = function (advertiserId) {
    var deferred = Q.defer();
    var advertisements;
    var advertsArray = new Array;
    var advertId;
    
    statisticRef.child('advertiser').child(advertiserId).once('value', function (snapshot) {
        if (snapshot.val() && snapshot.val().advertisements) {
            advertisements = snapshot.val().advertisements;
            for (advertId in advertisements) {
                if (typeof advertisements[advertId] !== 'function') {
                    advertisements[advertId].id = advertId;
                    advertsArray.push(advertisements[advertId]);
                }
            }
            
            deferred.resolve(advertsArray);
        } else {
            console.log(snapshot.val());
            deferred.reject(new Error('没有取到advertisement统计数据'));
        }
        
    });
    return deferred.promise;
};

Statistic.getAdvertisementDetail = function (advertId, advertiserId) {
    var deferred = Q.defer();
    var advertDetail;
    var dateId;
    var statisticArray = new Array;
    
    statisticRef.child('advertiser').child('detailInfo').child(advertiserId).child(advertId).once('value', function (snapshot) {
        if (snapshot.val()) {
            advertDetail = snapshot.val();
            
            for (dateId in advertDetail) {
                if (typeof advertDetail[dateId] !== 'function') {
                    advertDetail[dateId].date = dateId;
                    statisticArray.push(advertDetail[dateId]);
                }
            }
            deferred.resolve(statisticArray);
        } else {
            deferred.reject(new Error('没有取到广告:' + advertId + '的统计数据'));
        }
    });
    
    return deferred.promise;
};

Statistic.getAdvertiserData = function (advertiserId) {
    var deferred = Q.defer();
    var advertisementArray = new Array;
    var advertisements;
    var detail;
    var advertId;
    
    statisticRef.child('advertiser').child('detailInfo').child(advertiserId).once('value', function (snapshot) {
        if (snapshot.val()) {
            advertisements = snapshot.val();
            for (advertId in advertisements) {
                if (typeof advertisements[advertId] !== 'function'){
                    detail = advertisements[advertId];
                    
                    advertisementArray.push({
                        'id': advertId,
                        'statistics': detail
                    });
                }
            }
            deferred.resolve(advertisementArray);
        } else {
            deferred.reject(new Error('没有获得广告商:' + advertiserId + '统计数据'))
        }
    });
    
    return deferred.promise;
};