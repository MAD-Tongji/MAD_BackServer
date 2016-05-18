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