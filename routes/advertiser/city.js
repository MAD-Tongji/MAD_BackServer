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
            // 存在push数据
            var origin = snapshot.child(catalog).val();
            origin.push(advertId);
            district.child(catalog).set(origin);
            deferred.resolve();
        } else {
            // 不存在则新建
            var newCatalog = [];
            newCatalog.push(advertId);
            district.child(catalog).set(newCatalog);
            deferred.resolve();
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
        snapshot.forEach(function (district) {
            if(district.key() != "name") {
                districts.push({
                    id:district.key(),
                    name: district.val().name
                });
            }
        });
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
    var defer = Q.defer();
    //建立新的数据结构

    var advertsNeedModifying = new Array;
    add.forEach(function (addAdvert) {
        advertsNeedModifying.push({
            id: addAdvert,
            ifAdd: true
        });
    });
    remove.forEach(function (removeAdvert) {
        advertsNeedModifying.push({
            id: removeAdvert,
            ifAdd: false
        });
    });
    //修改数据库
    if (advertsNeedModifying.length < 1) {
        defer.resolve();
    } else {
        advertsNeedModifying.forEach(function (advertNeedModifying) {
            var advertRef = cityRef.child(city).child(advertNeedModifying.id).child(catalog);
            advertRef.once("value", function (snapshot) {
                if(snapshot.exists()) {
                    //取出内容放入array
                    var existedAdverts = new Array;
                    snapshot.val().forEach(function (advertId) {
                        existedAdverts.push(advertId);
                    });
                    //判断增删情况并增删
                    if(advertNeedModifying.ifAdd) {
                        //不存在则增
                        if(existedAdverts.indexOf(id) === -1) {
                            existedAdverts.push(id);
                        }
                    } else {
                        //存在则删
                        if(index = existedAdverts.indexOf(id) !== -1) {
                            existedAdverts.splice(index,1);
                        }
                    }
                    //写回数据库
                    advertRef.set(existedAdverts);
                }
                // else {
                //     defer.reject(new Error('该区不存在'));
                // }
            });
        });
        defer.resolve();
    }
    

    return defer.promise;
};