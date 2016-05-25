#!/usr/bin/env node
/// <reference path="../typings/node/node.d.ts" />
var wilddog = require('wilddog');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var collection = null;
var url = 'mongodb://121.42.57.59:27017/MAD_MONGO';

var os = require('os');

// /*---------------------野狗云初始化鉴权---------------------*/
// var superToken='vt3sPR4f6UanTCFANnyRhud7TvW0l1Ctq4hR8XUo';
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
// ref.authWithCustomToken(superToken,(error,authData)=>{
//     if (error) {
//         console.log("Login Failed!", error);
//     } else {
//         console.log("Authenticated successfully with payload:", authData);
//         connectMongo();
//     }
// });
// /*---------------------野狗云初始化鉴权---------------------*/

/**
 * @description 连接mongodb
 */
function connectMongo()
{
    try{
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            console.log("Connected succesfully to MongoDB server");
            collection = db.collection('advertisment');
            if(os.networkInterfaces().eth1 != null && os.networkInterfaces().eth1[0] != null && os.networkInterfaces().eth1[0].address == '121.42.57.59')
            dropCol(collection,function(collection){dataBind(collection);});
             //AdQuery({"advertiser":"test1@test-com"},(docs)=>{console.log("524:"+docs)});
            // queryTop3();
        });
    } catch(e){
        console.log("error:"+e.message);
    }
}

/**
 * @description 绑定advertisment数据，先删除旧表后重新生成新表，后期可加最后修改时间戳来判断需不需要删除旧表
 */
function dataBind(collection){
    var adRef = ref.child('advertisment');
    adRef.limitToFirst(999999999).on('child_added',(snap,prev)=>{
        var adObj = snap.val();
        adObj['adId'] = snap.key();
        collection.insertOne(adObj,{w:1},(err,result)=>{
            if(err == null)
            {
                console.log("insert success:" + adObj.adId);
            }
            else
            {
                console.log(err.message);
            }
        });
    });

    adRef.limitToFirst(999999999).on('child_removed',(snap)=>{
        console.log(snap.val());
        console.log(snap.key());
        collection.deleteOne({'adId':snap.key()},(err,result)=>{
            if(err == null)
            {
                console.log(result.result);
            }
            else
            {
                console.log(err.message);
            }
        });
    });

    adRef.limitToFirst(999999999).on('child_changed',(snap)=>{
        console.log(snap.val());
        console.log(snap.key());
        collection.updateOne({'adId':snap.key()},{$set:snap.val()},(err,result)=>{
            if(err == null)
                {
                    console.log(result.result);
                }
            else
                {
                    console.log(err.message);
                }
        });
    });

    setTimeout(function(){
        collection.createIndex({"adId":1},{'background':true,'unique':true},(err,result)=>{
            if(err == null)
            {
                console.log("\033[32mcreate index success:" + result + "\033[0m");
                // AdQuery({"advertiser":"test1@test-com"},(docs)=>{console.log(docs)});
            }
            else
            {
                console.log(err.message);
            }
        });
    },2000);
}

/**
 * @description 删除旧表
 */
function dropCol(collection,callback)
{
    collection.drop((err,reply)=>{
        if(err != null)
        console.log("\033[31mDrop Collection ERROR!!!!\033[0m");
        else
        console.log("\033[32mDrop Collection Success\033[0m");
        callback(collection);
    });
}

/**
 * @description 广告查询
 * @param {JSON} query mongodb的合法查询语句
 * @param {function} callback 回调函数，一个参数docs是查询到的文档
 */
function AdQuery(query,callback)
{
    collection.find(query).toArray((err,docs)=>{
        if (err != null)
        {
            console.log("\033[31m"+err+"\033[0m");
            callback(null);
        }
        else
        {
           callback(docs);
        }
    });
}

function queryTop3()
{
    collection.find({},{adId:1,broadcastTimes:1,_id:0,title:1}).sort({'broadcastTimes':-1}).limit(3).toArray((err,docs)=>{
        if (err != null)
        {
            console.log("\033[31m"+err+"\033[0m");
        }
        else
        {
           console.log(docs);
           var newtop3 = {advert_most:{}};
           for(var i = 0; i<3; i++)
           {
               newtop3.advert_most[docs[i].adId]={
                   broadcastTimes:docs[i].broadcastTimes,
                   title:docs[i].title
               }
           }
           console.log(newtop3);
           ref.child('statistic/admin/homePageData').update(newtop3,(err)=>{
               if(err == null){
                   console.log('更新top3成功啦');
               }else{
                   console.log('更新top3失败可');
               }
           });
        }
    });
}

exports.connectMongo=connectMongo;
exports.AdQuery=AdQuery;
exports.queryTop3=queryTop3;