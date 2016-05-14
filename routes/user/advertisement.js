var wilddog = require('wilddog');
var rootRef = new wilddog("https://wild-boar-00060.wilddogio.com/");
var userRef = rootRef.child('user');
var adRef = rootRef.child('advertisment');
var request = require('sync-request');
var Q = require('q');


// 车主接广告逻辑
// TODO：解决循环异步获取数据的问题

function findAdvertisementsByCoordinate(coordinate, callback) {
    // 后台广告查找流程：向高德地图请求经纬度周边poi信息(20条)->提取20个poi的类型->根据类型在数据库里查找广告->返回广告ID列表
    var httpURL = 'http://restapi.amap.com/v3/place/around?key=02127fede0258553291573039655b9f0&offset=20&radius=3000&extensions=all&location=' + coordinate.longitude + ',' + coordinate.latitude; 
    var element;
    var distance;
    var advertTypes;
    var districtNums = new Set();
    var catalogs = new Set();
    var i = 0;
    var advertIdList = [];
    try {
        console.log('1');
        var response = request('GET', httpURL);
        // console.log(JSON.parse(response.getBody()));
        if (response.statusCode === 200) {
            var jsonBody = JSON.parse(response.getBody());
            if (jsonBody.pois !== undefined) {
                var pois = jsonBody.pois;
                console.log('poi个数:' + pois.length);
                for (var j = 0; j < pois.length; j++) {
                    element = pois[j];
                    if (element.cityname !== undefined && element.cityname !== null) {
                        if (element.cityname === '上海市') {
                            // 获取行政区代码
                            districtNums.add(getDistrictCode(element.adname));
                            
                            // 根据poi类型获取广告类型
                            advertTypes = getAdvertismentTypeFromCode(element.typecode);
                            // console.log(advertTypes);
                            for (i = 0; i < advertTypes.length; i++) {
                                catalogs.add(advertTypes[i]);
                            }
                        }
                    }
                }
            } else {
                throw new Error('异常数据，没有pois');
            }
        } else {
            throw new Error('无法获取到高德地图数据，请求失败');
        }
    } catch (err) {
        console.log(err);
        throw new Error('501');
    }
    // console.log(districtNums);
    // console.log(catalogs);
    // 遍历districtNums和catalogs在野狗中查询对应类型的广告
    getAdvertisementByCatalog(districtNums, catalogs)
        .done(function (results) {
            callback(results);
        });
}

function getAdvertisementByCatalog(districtNums, catalogs) {
    var deferred = Q.defer();
    var idList = [];
    var i = 0;
    var j = 0;
    
    var districtArray = Array.from(districtNums);
    var catalogArray = Array.from(catalogs);
    
    for (i = 0; i < districtArray.length; i += 1) {
        (function(i) {
        var districtRef = rootRef.child('AdsInCitys').child('Shanghai').child(districtArray[i]);

        
        getIdByCatalogs(districtRef, catalogArray)
            .done(function (data) {
                console.log('data:');
                console.log(data);
                idList.push(data);
                deferred.resolve(idList);
            });
        })(i);
        
        // for (j = 0; j < catalogArray.length; j += 1) {
        //     getIdByCatalog(districtRef, catalogArray[j])
        //             .done(function (data) {
        //                 console.log(data);
        //                 idList.concat(data);
        //                     deferred.resolve(idList);

        //             });
        //     // (function (districtRef, catalogArray[j]) {
        //     //     getIdByCatalog(districtRef, catalogArray[j])
        //     //         .done(function (data) {
        //     //             console.log(data);
        //     //             idList.concat(data);
        //     //         });
        //     // })(districtRef, catalogArray[j])
        // }
    }
    // districtNums.forEach(function (district) {
    //     var districtRef = rootRef.child('AdsInCitys').child('Shanghai').child(district);
    //     catalogs.forEach(function (catalog) {
    //         (function (districtRef, catalog) {
    //             getIdByCatalog(districtRef, catalog)
    //                 .done(function (data) {
    //                     console.log(data);
    //                     idList.concat(data);
                       
    //                 });
    //         })(districtRef, catalog)
    //     });
    // });
    return deferred.promise;
}


function getIdByCatalogs(districtRef, catalogs) {
    var deferred = Q.defer();
    var idList = [];
    var catalog;
    for (var i = 0; i < catalogs.length; i += 1) {
        catalog = catalogs[i];
        
        (function (catalog) {
            console.log('catalog:' + catalog);
            getIdByCatalog(districtRef, catalog)
                .done(function (data) {
                    idList.push(data);
                    deferred.resolve(idList);
                });
            // districtRef.child(catalogs[i]).once('value', function (snapshot) {
            //     console.log('snapshot:');
            //     console.log(snapshot.val());
            //     idList.concat(snapshot.val());
            //     deferred.resolve(idList);
            // }, function (err) {
            //     deferred.reject(err);
            // });
        })(catalog);
    }
    return deferred.promise;
}

function getIdByCatalog(districtRef, catalog) {
    var deferred = Q.defer();
    var ids = [];
    districtRef.child(catalog).once('value', function (snapshot) {
        console.log('snapshot:');
        console.log(snapshot.val());
        ids = snapshot.val();
    }, function (err) {
        deferred.reject(err);
    });
    deferred.resolve(ids);
    return deferred.promise;
}


function getDistrictCode (districtName) {
    var district = {
        '嘉定区': '001',
        '金山区': '002',
        '奉贤区': '003',
        '松江区': '004',
        '青浦区': '005',
        '闵行区': '006',
        '浦东新区': '007',
        '长宁区': '008',
        '黄浦区': '009',
        '宝山区': '010',
        '虹口区': '011',
        '杨浦区': '012',
        '崇明县': '013',
        '徐汇区': '014',
        '静安区': '015',
        '普陀区': '016'
    }
    
    return district[districtName];
}


/**
 * 将高德API的typecode转换为对应的广告类型
 * 1	accommodation	食宿
 * 2	commodity	商品
 * 3	education	教育
 * 4	entertainment	影视娱乐
 * 5	recruit	招聘
 * 6	service	服务
 * 7	social	社交
 * 8	tenancy	租赁
 * 9	other	其他
 * 
 * 高德poi typecode：
 * 01：汽车服务
 * 02：汽车销售
 * 03：汽车维修
 * 04: 摩托车服务
 * 05: 餐饮服务
 * 06：购物服务
 * 07: 生活服务
 * 08: 体育场馆，影剧院
 * 09: 医疗相关
 * 10: 住宿服务
 * 11: 风景名胜
 * 12: 商务住宅
 * 13: 政府机构及社会团体
 * 14: 科教文化服务
 * 15: 交通设施服务
 * 16: 金融保险服务 
 * 17: 公司企业
 * 18: 道路附属设施（收费站之类的）
 * 19：地名地址信息
 * 20：公共设施
 * 22：事件活动
 * 97：室内设施
 * 99：通行设施
 */
function getAdvertismentTypeFromCode(typecode) {
    var codeToType = {
        '01': ['accommodation', 'service', 'tenancy'],
        '02': ['commodity', 'service', 'tenancy'],
        '03': ['service', 'commodity'],
        '04': ['commodity', 'tenancy'],
        '05': ['accommodation', 'commodity', 'entertainment'],
        '06': ['commodity','social','entertainment'],
        '07': ['service', 'recruit'],
        '08': ['entertainment','recruit','social','accommodation'],
        '09': ['commodity','accommodation','service'],
        '10': ['accommodation','entertainment','service'],
        '11': ['entertainment','social'],
        '12': ['entertainment','accommodation','service'],
        '13': ['recruit'],
        '14': ['education','entertainment','recruit'],
        '15': ['service', 'accommodation', 'tenancy'],
        '16': ['recruit', 'commodity'],
        '17': ['recruit','entertainment','service'],
        '18': ['other','accommodation','entertainment'],
        '19': ['other'],
        '20': ['social', 'other', 'tenancy'],
        '22': ['entertainment','other'],
        '97': ['other'],
        '99': ['accommodation']
    };
    return codeToType[typecode.substring(0,2)];
}


exports.findAdvertisementsByCoordinate = findAdvertisementsByCoordinate;
// 121.49491,  31.24169 东方明珠
// test
// findAdvertisementsByCoordinate({
//   longitude: 121.49491,
//   latitude: 31.24169
// });
