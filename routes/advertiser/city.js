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


/**
 * 获取投放商圈列表
 * @param city
 * @returns {*}
 */
City.district = function (city) {
    var defer = Q.defer();
    var districts = new Array;
    cityRef.child(city).once("value", function (snapshot) {
        console.log(snapshot.val());
        snapshot.forEach(function (district) {
            if(district.key() != "name") {
                districts.push({
                    id:district.key(),
                    name: district.val().name
                });
            }
        });
        console.log(districts);
        defer.resolve(districts);
    });
    return defer.promise;
};

/**
 * 修改city列表中的映射
 * @param id
 * @param city
 * @param catalog
 * @param add
 * @param remove
 */
City.modifyAdvertById = function(id,city,catalog,add,remove) {
    var addFinished = false;
    var removeFinished = false;
    var bothFinished = function () {
        if (addFinished && removeFinished) {
            defer.resolve();
        }
    };
    var defer = Q.defer();
    //添加id
    add.forEach(function (distId) {
        console.log(city +' '+ distId +' '+ catalog);
        var advertRef = cityRef.child(city).child(distId).child(catalog);
        if (advertRef != null) {
            advertRef.once("value", function (snapshot) {
                console.log('snapshot:');
                console.log(snapshot.val());
                //取出内容放入array
                var advertIds = new Array;
                snapshot.val().forEach(function (advertId) {
                    advertIds.push(advertId);
                });
                //删除内容
                if(advertIds.indexOf(id) === -1){
                    advertIds.push(id);
                }
                console.log('advert id s');
                console.log(advertIds);
                //添加内容
                advertIds.push(id);
                //返回设置
                advertRef.set(advertIds);
                addFinished = true;
                bothFinished();
            });
        } else {
            defer.reject();
        }
    });
    //删除id
    remove.forEach(function (distId) {
        console.log('tag:');
        console.log(catalog);
        var advertRef = cityRef.child(city).child(distId).child(catalog);
        if (advertRef !== null) {
            advertRef.once("value", function (snapshot) {
                console.log(snapshot.val());
                //取出内容放入array
                var advertIds = new Array;
                snapshot.val().forEach(function (advertId) {
                    advertIds.push(advertId);
                });
                //删除内容
                if(advertIds.indexOf(id) === -1){
                    advertIds.splice(index,1);
                }
                //返回设置值
                advertRef.set(advertIds);
                removeFinished = true;
                bothFinished();
            });
        } else {
            defer.reject();
        }
    });

    return defer.promise;
};