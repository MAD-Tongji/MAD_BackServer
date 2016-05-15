var wilddog = require('wilddog');
var rootRef = new wilddog("https://wild-boar-00060.wilddogio.com/");
var userRef = rootRef.child('user');
var adRef = rootRef.child('advertisment');
var syncRequest = require('sync-request');
var request = require('request');
var Q = require('q');


var utils = require('../../lib/publicUtils');
/**
 * @interface
 * @description {interface} 获取用户已接广告
 */
function getAllAdUsed(req,res) {
        
    var userid = req.params.userid || null;
    var token = req.query.token || null;
    var result = new Object;
    if(userid == null || token == null || userid != utils.token2id(token))
    {
        result.errCode = 100;
        res.json(result);
    }
    else
    {
        var ref = userRef.child(userid) || null;
        ref.once('value',(snap)=>{
            if(snap.val() == null)
            {
                result.errCode = 100;
            }
            else{
                var adlist = snap.val().adUsedList;
                var detailArray = new Array();
                for(var i = 0; i < adlist.length; i++)
                {
                    detailArray.push(utils.getAdDetail(adlist[i]));
                }
                result.errCode = 0;
                result.adList=detailArray;
                // result.adUsedList = adlist;
            }
            res.json(result);
        });
    }
    
    // res.json(result);  
}

exports.getAllAdUsed = getAllAdUsed;

/**
 * @interface
 * @description {interface} 获取广告详情
 */
function getDetail(req,res) {
    var adid = req.params.adid;
    var result = new Object;
    var detail = utils.getAdDetail(adid) || null;
    if(detail == null)
    {
        result.errCode = 201;
    }
    else
    {
        result.errCode = 0;
        result.detail = detail;
    }
    res.json(result);
}

exports.getDetail = getDetail;

/**
 * @interface
 * @description {interface} 设置广告过滤参数
 */
function setFilter(req,res) {
    console.log(req.body);
    console.log(req.params);
    var filterArray = req.body.adValidationSettings.split(',');
    var token = req.body.token;
    var userId = utils.token2id(token);
    console.log(filterArray,token,userId);
    if (userId == null)
    {
        res.json({errCode:101});
    }
    else if(filterArray.length != 9)
    {
        res.json({errCode:999,errMessage:"filterArray不合规范"});
    }
    else
    {
        var ref = userRef.child(userId).child('filter');
        ref.once('value',(snap)=>{
            if(snap.val() == null)
            {
                res.json({errCode:999,errMessage:"找不到filter"});
            }
            else
            {
                ref.set({
                    accommodation : filterArray[0],
                    commodity : filterArray[1],
                    education : filterArray[2],
                    entertainment : filterArray[3],
                    other : filterArray[4],
                    recruit : filterArray[5],
                    service : filterArray[6],
                    social : filterArray[7],
                    tenancy : filterArray[8],
                },
                (err)=>{
                    if(err!=null)
                    {
                        res.json({errCode:999,errMessage:"修改filter失败，严重错误"});
                    }
                    else
                    {
                        var result = new Object;
                        result.errCode = 0;
                        // result.filterArray =filterArray;
                        res.json(result);
                        
                    }
                });
            }
        });
    }
}

exports.setFilter = setFilter;


/**
 * 根据district和周边poi类型在wilddog上获取广告ID列表
 */
function userGetAdsByCoordinate(coordinate, callback) {
    // 后台广告查找流程：向高德地图请求经纬度周边poi信息(20条)->提取20个poi的类型->根据类型在数据库里查找广告->返回广告ID列表

    /**
     * 逻辑：
     * 1. 获取行政区代码
     * 2. 获取poi类型数组
     * 3. 在野狗中查询
     * 4. 返回id结果数组
     */
    
    Q.all([getDistrictCodeWithCoordinate(coordinate), getAroundCatalog(coordinate)])
        .then(getAdvertIdsFromWilddog)
        .then(function (idArray) {
            console.log('idArray');
            console.log(idArray);
            callback(idArray);
        })
        .catch(function (error) {
            console.log(error);
        });
}

/**
 * 使用高德API获取行政区代码
 */
function getDistrictCodeWithCoordinate(coordinate) {
    var deferred = Q.defer();
    var districtName;
    var districtCode;
        
    var httpURL = ' http://restapi.amap.com/v3/geocode/regeo?key=02127fede0258553291573039655b9f0&location=' + coordinate.longitude + ',' + coordinate.latitude;
    
    request(httpURL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body);
            var jsonBody = JSON.parse(response.body);
            if (jsonBody.regeocode) {
                districtName = jsonBody.regeocode.addressComponent.district;
                districtCode = getDistrictCode(districtName);
                deferred.resolve(districtCode);
            } else {
                deferred.reject(new Error('请求行政区时没有数据'));
            }
        } else {
            deferred.reject(new Error('向高德请求行政区错误'));
        }
    });
    
    return deferred.promise;
}

/**
 * 使用高德API获取周边poi类型数组
 */
function getAroundCatalog(coordinate) {
    var deferred = Q.defer();
    var aroundPoiCatalogs = [];
    var catalogSet = new Set();
    var httpURL = 'http://restapi.amap.com/v3/place/around?key=02127fede0258553291573039655b9f0&offset=20&radius=3000&extensions=all&location=' + coordinate.longitude + ',' + coordinate.latitude;
    var advertTypes;
    
    request(httpURL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body);
            var jsonBody = JSON.parse(body);
            if (jsonBody.pois !== undefined) {
                var pois = jsonBody.pois;
                console.log('poi个数:' + pois.length);
                for (var j = 0; j < pois.length; j++) {
                    element = pois[j];
                    if (element.cityname !== undefined && element.cityname !== null) {
                        if (element.cityname === '上海市') {                            
                            // 根据poi类型获取广告类型
                            advertTypes = getAdvertismentTypeFromCode(element.typecode);
                            // console.log(advertTypes);
                            for (i = 0; i < advertTypes.length; i++) {
                                catalogSet.add(advertTypes[i]);
                            }
                        }
                    }
                }
                aroundPoiCatalogs = Array.from(catalogSet);
                deferred.resolve(aroundPoiCatalogs);
            } else {
                deferred.reject(new Error('异常数据，没有pois'))
            }
        } else {
            deferred.reject(new Error('向高德请求poi时错误'));
        }
    });
    
    return deferred.promise;
}

/**
 * 从wilddog拿数据
 */
function getAdvertIdsFromWilddog(params) {
    var districtCode = params[0];
    var catalogArray = params[1];
    var deferred = Q.defer();
    var advertIdArray = [];
    var advertIdSet;// = new Set();
    var advertIdRef = rootRef.child('AdsInCitys').child('Shanghai');
    
    advertIdRef.child(districtCode).once('value', function (snapshot) {
        var value = snapshot.val();
        for (var i = 0; i < catalogArray.length; i += 1) {
            var element = catalogArray[i];
            advertIdArray = advertIdArray.concat(value[element]);
        }
        advertIdSet = new Set(advertIdArray);
        advertIdArray = Array.from(advertIdSet);
        deferred.resolve(advertIdArray);
    }, function (error) {
        console.log('野狗查询时出错');
        deferred.reject(error);
    });
    
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

exports.userGetAdsByCoordinate = userGetAdsByCoordinate;