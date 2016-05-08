/**
 * Created by mandyxue on 16/5/8.
 */

var memcached = require('memcached');
var Q = require('q');
var wilddog = require('wilddog');
var cityRef = new wilddog('https://wild-boar-00060.wilddogio.com/AdsInCitys');
var q = require('q');

module.exports = City;

function City(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}

/**
 * 添加城市列表中广告的映射
 * @param advertId
 * @param cityName
 * @param districtId
 * @param catalog
 */
City.addAdvertMapping = function(advertId, cityName, districtId, catalog) {
    var deferred = Q.defer();

    // 获取城市
    var district = cityRef.child(cityName).child(districtId);

    district.once("value", function (snapshot) {
        // 判断节点是否存在
        if (snapshot.child(catalog).exists()) {
            var origin = snapshot.child(catalog).val();
            origin.push(advertId);
            district.child(catalog).set(origin);
            deferred.resolve();
        } else {
            deferred.reject();
        }
    });

    return deferred.promise;
};