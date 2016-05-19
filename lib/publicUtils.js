/// <reference path="../typings/node/node.d.ts" />
var wilddog = require('wilddog');
var CryptoJS = require('crypto-js');
var HMAC_SHA256 = require('crypto-js/hmac-sha256');
var HMAC_MD5 = require('crypto-js/hmac-md5');
var crypto = require('crypto');
var moment = require('moment');
var mg = require('../bin/mongo');

var conversionRate = 0.2;
var passwd256 = "c39784d8d3752976e4426b1824c1265d39c87cbf616892b4897e711340a7d0fd";
var passwdmd5 = "4a23fd3b644d9fd8b75d45bd64818188c425011f4bd9b5b4eab24cef49d29949";

var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
var AdRef = ref.child('advertisment');
var statisticRef = ref.child('statistic');

var Token2Id_Memcached = new Object;
var adList_Memcached = new Object;

/**
 * 七牛云config
 */
var qiniu = require('qiniu');
qiniu.conf.ACCESS_KEY = 'pUG6wmLMXbkv3SSV4W4TgAmxK8pKKLe8-l_0phN4';
qiniu.conf.SECRET_KEY = '_qrTuNss5HS7SdfL8IVvnCoy7lCWyPRFvdA6OI6c';

//要上传的空间
bucket = 'madtest';

/**
 * 七牛云生成upload token
 */

// 构建上传策略函数
function uptoken(bucket) {
  var putPolicy = new qiniu.rs.PutPolicy(bucket);
  return putPolicy.token();
}

/**
 * @description 输入userid加密得到token,在野狗中更新token映射
 * @param {String} userid 传入的 ·管理员/广告商/用户· 的id
 * @return {String} 生成的token
 */
function getToken(userid){
    var result = HMAC_SHA256(HMAC_MD5((userid + new Date().getTime()),passwdmd5),passwd256).toString();
    var newMapping = new Object;
    newMapping[result] = {
        id : userid,
        expiration : (new Date().getTime() + 7 * 24 * 3600 * 1000)
    };
    ref.child('token2id').orderByChild('id').equalTo(userid).once('value',(snap)=>{
        for(var key in snap.val())
        {
            ref.child('token2id').child(key).remove();
        }
    });
    ref.child('token2id').update(newMapping);
    return result;
}
/**
 * @description 根据某个子节点的值来查询获取匹配的节点
 * @param {ref} relativeRef 传入要进行查询的节点
 * @param {String} childKey 要匹配的子节点名
 * @param {String} value 要匹配的值，理论上不仅仅可以是字符串还可以是JSON，但未测试，而且考虑到性能最好只是字符串
 * @param {function} callback 回调函数，有一个参数，匹配到的子节点的JSON格式数据
 */
function Query_EqualTo(relativeRef,childKey,value,callback)
{
    relativeRef.orderByChild(childKey).equalTo(value).once('value',(snapShot)=>{
        if (snapShot.val() == null)
        {
            // console.log('no return');
            callback(null);
        }
        else
        {
            for(var key in snapShot.val())
            {
                // console.log(key);//如果需要调试的时候看看到底输出的是哪个节点，可取消本行注释
                callback(snapShot.val()[key]);
                return;//为了防止出现多个搜索结果导致多次回调。。粗暴的return打断不好，但是还没有想到解决办法
            }
        }
    });
}
/**
 * @description 创建假memcache，会随程序崩溃消亡。生命周期中会同步野狗云中的token映射、广告列表
 */
function fakeMemcache(){
    ref.child('token2id').on('value',(snap)=>{
        Token2Id_Memcached = snap.val();
        // console.log(Token2Id_Memcached);
    });
    ref.child('advertisment').on('value',(snap)=>{
        adList_Memcached = snap.val();
    });
}
/**
 * @description 在假memcache中获取输入token所对应的id
 * @param {String} token 输入的token
 * @return {String} 对应的id，不存在或过期的则返回null
 */
function token2id(token){
    var obj = Token2Id_Memcached[token] || null;
    if(obj == null || obj.expiration < new Date().getTime())
    {return null;}
    else
    {return obj.id || null;}
}
/**
 * @description 在假memcache中回去广告详情
 * @param {String} adId 输入的广告Id
 * @return {JSON} 广告的详情
 */
function getAdDetail(adId)
{
    return adList_Memcached[adId] || null;
}

/*用户密码加密，数据库存加密后的密码*/
function hashPassword(pass, fn){
    var hash = crypto.createHash('sha256')
        .update(pass)
        .digest('hex');
    fn(null, hash);
}

function playAd(token,adid){
    var thisistoday = moment().format('YYYY-MM-DD');
    statisticRef.child('/admin/homePageData').once('value',(snap)=>{
        if(snap.val()==null){
            console.log(redLog('严重错误！/admin/homePageData节点获取失败'));
        }else{
            var newBroadcastTimes = moment().format('YYYY-MM-DD HH:mm:ss');
            var totalBroadcastTimes = snap.val().totalBroadcastTimes+1;
            statisticRef.child('/admin/homePageData').update({newBroadcastTimes:newBroadcastTimes,totalBroadcastTimes:totalBroadcastTimes},(err)=>{
                if(err==null){
                    console.log(greenLog('更新newBroadcastTimes、totalBroadcastTimes成功'));
                    mg.queryTop3();
                }else{
                    console.log(redLog('更新newBroadcastTimes、totalBroadcastTimes失败'));
                }
            });
            if(snap.val().advert_detail7[thisistoday]){
                console.log(greenLog('存在了这一天的admin统计'));
                var newday = {};
                newday[thisistoday]=snap.val().advert_detail7[thisistoday];
                newday[thisistoday].totalBroadcastTimes += 1;
                newday[thisistoday].totalIncome += getAdDetail(adid).price*conversionRate;
                statisticRef.child('/admin/homePageData/advert_detail7').update(newday,(err)=>{
                    if(err == null){
                        console.log(greenLog('admin更新播放次数和总价成功'))
                    }
                    else{
                        console.log(err);
                    }
                });
                statisticRef.child('/admin/incomeDate').update(newday,(err)=>{
                    if(err == null){
                        console.log(greenLog('admin更新播放次数和总价成功'))
                    }
                    else{
                        console.log(err);
                    }
                });
            }
            else {
                console.log(redLog('不存在这一天的admin统计'));
                var newday = {};
                newday[thisistoday]={
                    totalBroadcastTimes:1,
                    totalIncome:getAdDetail(adid).price*conversionRate
                };
                statisticRef.child('/admin/homePageData/advert_detail7').update(newday,(err)=>{
                    if(err == null){
                        console.log(greenLog('admin更新播放次数和总价成功'))
                    }
                    else{
                        console.log(err);
                    }
                });
                statisticRef.child('/admin/incomeDate').update(newday,(err)=>{
                    if(err == null){
                        console.log(greenLog('admin更新播放次数和总价成功'))
                    }
                    else{
                        console.log(err);
                    }
                });
            }
        }
    });
    var usrid = token2id(token);
    // console.log(adtitle);
    var advertismentReference = AdRef.child(adid);
    advertismentReference.once('value',(snap)=>{
        if(snap.val()!= null)
        {
                var broadcastTimes = snap.val().broadcastTimes;
                // console.log(broadcastTimes);
                // console.log(snap.key());
                advertismentReference.update({'broadcastTimes':(broadcastTimes+1)},(err)=>{
                    if(err==null)
                    {
                        console.log('\033[32mupdate '+snap.key()+' broadcastTimes succeded\033[0m');
                    }
                    else
                    {
                        console.log('\033[31mupdate '+snap.key()+' broadcastTimes failed\033[0m');
                    }
                });
        }
        else
        console.log('\033[31mError! snapshot not found in function playAd!\033[0m]');
    });
    //完成advertisment下的广告播放字段修改
    var userStatisticReference =  statisticRef.child('user/'+usrid);
    userStatisticReference.once('value',(snap)=>{
        if(snap.val() == null)
        {
            var newUserStatistic = {
                balance:getAdDetail(adid).price,
                totalIncome:getAdDetail(adid).price,
                monthly:'',
                daily:''
            }
            userStatisticReference.update(newUserStatistic,(err)=>{
                if(err==null)
                {
                    console.log(greenLog('succeded'));
                    dailyStatistic(userStatisticReference.child('daily'),adid);
                    monthlyStatistic(userStatisticReference.child('monthly'),adid);
                }
                else
                {
                    console.log(redLog('failed'));
                }
            });
        }
        else
        {
            // console.log(snap.val());
            var newIncome = snap.val().totalIncome + getAdDetail(adid).price;
            var newBalance = snap.val().balance + getAdDetail(adid).price;
            userStatisticReference.update({totalIncome:newIncome,balance:newBalance},(err)=>{
                if(err==null)
                {
                    console.log(greenLog('succeded'));
                }
                else
                {
                    console.log(redLog('failed'));
                }
            });
            dailyStatistic(userStatisticReference.child('daily'),adid);
            monthlyStatistic(userStatisticReference.child('monthly'),adid);
        }
    });
    
    var advertiserStatisticReference = statisticRef.child('advertiser');
    advertiserStatistic(advertiserStatisticReference,adid);
}

function dailyStatistic(dailyRef,ADID){
    var adprice = getAdDetail(ADID).price;
    var adtitle = getAdDetail(ADID).title;
    var today = moment().format("YYYY-MM-DD");
    dailyRef.child(today).once('value',(snap)=>{
        if(snap.val() == null)
        {
            console.log(redLog('新的一天'));
            var obj = {income:adprice,top5:{}}; 
            obj.top5[ADID]={
                title:adtitle,
                income:adprice
            };
            dailyRef.child(today).update(obj,(err)=>{
                if(err == null)
                {
                    console.log(greenLog('收入啦'));
                }
                else
                {
                    console.log(redLog('钱没到账！'));
                }
            });
        }
        else
        {
            console.log(greenLog('勤劳的一天'));
            var income = snap.val().income + adprice;
            dailyRef.child(today).update({income:income},(err)=>{
                if(err == null)
                {
                    console.log(greenLog('当天的总收入增加啦'));
                }
                else
                {
                    console.log(redLog('然而总收入却无法增加！'));
                }
            });
            var adBroadcasted = snap.val().top5;
            if(adBroadcasted[ADID] == null)
            {
                var obj = {};
                obj[ADID]={
                    title:adtitle,
                    income:adprice
                };
                dailyRef.child(today+'/top5').update(obj,(err)=>{
                    if(err == null)
                    {
                        console.log(greenLog('又放一条广告'));
                    }
                    else
                    {
                        console.log(redLog('明明又放了一条广告！'));
                    }
                });
            }
            else
            {
                var updateObj = {};
                updateObj[ADID] = adBroadcasted[ADID];
                updateObj[ADID].income += adprice;
                dailyRef.child(today+'/top5').update(updateObj,(err)=>{
                    if(err == null)
                    {
                        console.log(greenLog('放过了又放了一次'));
                    }
                    else
                    {
                        console.log(redLog('明明又放了一次！'));
                    }
                });
            }
            
        }
    });
}

function monthlyStatistic(monthlyRef,ADID){
    var adprice = getAdDetail(ADID).price;
    var adtitle = getAdDetail(ADID).title;
    var thisMonth = moment().format("YYYY-MM");
    monthlyRef.child(thisMonth).once('value',(snap)=>{
        if(snap.val() == null)
        {
            console.log(redLog('没有该月的月统计'));
            var newMonth = {
                income:adprice,
                top5:{}
            };
            newMonth.top5[ADID]={
                income:adprice,
                title:adtitle
            }
            monthlyRef.child(thisMonth).update(newMonth,(err)=>{
                if(err == null)
                {
                    console.log(greenLog('新的月统计'));
                }
                else
                {
                    console.log(redLog('创建新的月统计失败'));
                }
            });
        }
        else
        {
            console.log(greenLog('该月的月统计如下：'));
            console.log(snap.val());
            var newIncome = snap.val().income +adprice;
            monthlyRef.child(thisMonth).update({income:newIncome},(err)=>{
                if(err == null)
                {
                    console.log(greenLog('本月收入已更新'));
                }
                else
                {
                    console.log(redLog('本月收入更新失败'));
                }
            });
            var adBroadcasted = snap.val().top5;
            if(adBroadcasted[ADID] == null)
            {
                var obj = {};
                obj[ADID]={
                    title:adtitle,
                    income:adprice
                };
                monthlyRef.child(thisMonth+'/top5').update(obj,(err)=>{
                    if(err == null)
                    {
                        console.log(greenLog('又放一条广告'));
                    }
                    else
                    {
                        console.log(redLog('明明又放了一条广告！'));
                    }
                });
            }
            else
            {
                var updateObj = {};
                updateObj[ADID] = adBroadcasted[ADID];
                updateObj[ADID].income += adprice;
                monthlyRef.child(thisMonth+'/top5').update(updateObj,(err)=>{
                    if(err == null)
                    {
                        console.log(greenLog('放过了又放了一次'));
                    }
                    else
                    {
                        console.log(redLog('明明又放了一次！'));
                    }
                });
            }
        }
    });
}

function advertiserStatistic(advertiserRef,ADID){
    var ad = getAdDetail(ADID);
    var advertiser = ad.advertiser;
    var adprice = ad.price;
    var adtitle = ad.title;
    var childRef = advertiserRef.child(advertiser);
    var detailInfoRef = advertiserRef.child('detailInfo/'+advertiser);
    childRef.once('value',(snap)=>{
        if(snap.val() == null){
            console.log(redLog('该广告商从未统计'));
            var newAdvertiserobj = {};
            newAdvertiserobj={advertisements:{},totalSpend:adprice};
            newAdvertiserobj.advertisements[ADID]={
                broadcastSum:1,
                priceSum:adprice,
                startDate:moment().format('YYYY-MM-DD'),
                title:adtitle
            }
            console.log(newAdvertiserobj);
            childRef.update(newAdvertiserobj,(err)=>{
                if(err == null){
                    console.log(greenLog('创建新广告商统计成功'));
                }
                else{
                    console.log(redLog('创建新广告商统计失败'));
                }
            });
            var newDetailInfoobj = {};
            newDetailInfoobj[ADID]={};
            newDetailInfoobj[ADID][moment().format('YYYY-MM-DD')]={totalBroadcast:1,totalPrice:adprice};
            console.log(newDetailInfoobj);
            detailInfoRef.update(newDetailInfoobj,(err)=>{
                if(err == null){
                    console.log(greenLog('创建新的广告详细信息统计成功'));
                }else{
                    console.log(redLog('创建新的广告详细信息统计失败'));
                }
            });
        }
        else{
            console.log(greenLog('该广告商已经有过统计了喔：'));
            // console.log(snap.val());
            var newtotalSpend = snap.val().totalSpend + adprice;
            childRef.update({totalSpend:newtotalSpend},(err)=>{
                if(err == null){
                    console.log(greenLog('更新totalSpend成功'));
                }
                else{
                    console.log((redLog('更新totalSpend失败')));
                }
            });
            if(snap.val().advertisements[ADID] == null){
                console.log(redLog('该广告没有播放过：'+ADID));
                var newAdRecordObj = {};
                newAdRecordObj[ADID]={
                    broadcastSum:1,
                    priceSum:adprice,
                    startDate:moment().format('YYYY-MM-DD'),
                    title:adtitle
                };
                childRef.child('advertisements').update(newAdRecordObj,(err)=>{
                    if(err == null){
                        console.log(greenLog('新广告播放记录成功'));
                    }
                    else{
                        console.log(redLog('新广告播放记录失败'));
                    }
                });
                var newAdDetailobj = {};
                newAdDetailobj[ADID]={};
                newAdDetailobj[ADID][moment().format('YYYY-MM-DD')]={totalBroadcast:1,totalPrice:adprice};
                detailInfoRef.update(newAdDetailobj,(err)=>{
                    if(err == null){
                        console.log(greenLog('增加新的广告详情记录成功'));
                    }else{
                        console.log(redLog('增加新的广告详情记录失败'));
                    }
                });
            }
            else{
                console.log(greenLog('该广告播放过：'+ADID));
                var bs = snap.val().advertisements[ADID].broadcastSum +1;
                var ps = snap.val().advertisements[ADID].priceSum + adprice;
                console.log(bs);
                console.log(ps);
                childRef.child('advertisements/'+ADID).update({broadcastSum:bs,priceSum:ps},(err)=>{
                    if(err == null){
                        console.log(greenLog('广告播放记录更新成功'));
                    }
                    else{
                        console.log(redLog('广告播放记录更新失败'));
                    }
                });
                detailInfoRef.child(ADID+'/'+moment().format('YYYY-MM-DD')).once('value',(snap)=>{
                    if(snap.val()==null){
                        console.log(redLog(moment().format('YYYY-MM-DD')+'没有广告编号'+ADID+'的详细播放记录'));
                        var newAdDetailobj = {};
                        newAdDetailobj[moment().format('YYYY-MM-DD')]={totalBroadcast:1,totalPrice:adprice};
                        detailInfoRef.child(ADID).update(newAdDetailobj,(err)=>{
                            if(err == null){
                                console.log(greenLog('增加新的广告详情记录成功'));
                            }else{
                                console.log(redLog('增加新的广告详情记录失败'));
                            }
                        });
                    }else{
                        console.log(greenLog(moment().format('YYYY-MM-DD')+'有广告编号'+ADID+'的详细播放记录:'));
                        console.log(snap.val());
                        var newtb = snap.val().totalBroadcast+1;
                        var newtp = snap.val().totalPrice+adprice;
                        detailInfoRef.child(ADID+'/'+moment().format('YYYY-MM-DD')).update({totalBroadcast:newtb,totalPrice:newtp});
                    }
                });
            }
        }
    });
}


function greenLog(text)
{
    return ('\033[32m'+text+'\033[0m');
}

function redLog(text)
{
    return ('\033[31m'+text+'\033[0m');
}



exports.getToken = getToken;
exports.Query_EqualTo =  Query_EqualTo;
exports.token2id = token2id;
exports.fakeMemcache = fakeMemcache;
exports.getAdDetail = getAdDetail;
exports.hashPassword = hashPassword;
exports.playAd = playAd;
exports.greenLog = greenLog;
exports.redLog = redLog;
exports.uptoken = uptoken;
