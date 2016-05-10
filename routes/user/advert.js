var wilddog = require('wilddog');
var rootRef = new wilddog("https://wild-boar-00060.wilddogio.com/");
var userRef = rootRef.child('user');
var adRef = rootRef.child('advertisment');
var request = require('sync-request');
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


function findAdvertisementsByCoordinate(coordinate) {
    // 后台广告查找流程：向高德地图请求经纬度周边poi信息(20条)->提取20个poi的类型->根据类型在数据库里查找广告->返回广告ID列表
    var httpURL = 'http://restapi.amap.com/v3/place/around?key=02127fede0258553291573039655b9f0&offset=20&radius=5000&extensions=all&location=' + coordinate.longitude + ',' + coordinate.latitude; 
    var element;
    var districtNum;
    var distance;
    var advertTypes;
    var results = new Set();
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
                            districtNum = getDistrictCode(element.adname);
                            
                            // 根据poi类型获取广告类型
                            advertTypes = getAdvertismentTypeFromCode(element.typecode);
                            // console.log(advertTypes);
                            for (i = 0; i < advertTypes.length; i++) {
                                results.add(advertTypes[i]);
                            }
                            // 遍历results在野狗中查询对应类型的广告
                            // console.log('results');
                            // console.log(results);
                            var districtRef = rootRef.child('AdsInCitys').child('Shanghai').child(districtNum);
                            
                            results.forEach(function (item) {
                                // console.log('item' + i++);
                                // console.log(item);
                                
                                getAdvertisementByCatalog(districtRef, item)
                                    .done(function (data) {
                                        console.log('aksdjfasd');
                                        // console.log('data:');
                                        // console.log(data);
                                        advertIdList.push(['data']);
                                    }, function (error) {
                                        console.log('野狗获取数据error');
                                        console.log(error);
                                    });
                            });
                            // console.log('advertIdList');
                            // console.log(advertIdList);
                        }
                    } else {
                        console.log('异常数据');
                        console.log(element);
                    }
                }
                console.log('2');
            } else {
                console.log('异常数据');
                console.log(jsonBody);
            }
        } else {
            console.log('无法获取到数据');
        }
    } catch (err) {
        console.log('无法获取到数据');
        console.log(err);
    }
    console.log('4');
    var advertIdSet = new Set(advertIdList);
    console.log('advertIdList');
    console.log(advertIdList);
    return advertIdList;
}

function getAdvertisementByCatalog(districtRef, catalog) {
    var defer = Q.defer();
    districtRef.child(catalog).once('value', function (snapshot) {
        // console.log('snapshot');
        // console.log(snapshot.val());
        defer.resolve(snapshot.val());
    }, function (err) {
        console.log('从wilddog获取数据失败');
        defer.reject(err);
    });
    
    return defer.promise;
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
