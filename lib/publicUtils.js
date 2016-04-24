/// <reference path="../typings/node/node.d.ts" />
var wilddog = require('wilddog');
var HMAC_SHA256 = require('crypto-js/hmac-sha256');
var HMAC_MD5 = require('crypto-js/hmac-md5');

var passwd256 = "c39784d8d3752976e4426b1824c1265d39c87cbf616892b4897e711340a7d0fd";
var passwdmd5 = "4a23fd3b644d9fd8b75d45bd64818188c425011f4bd9b5b4eab24cef49d29949";

var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
/**
 * @description 输入userid加密得到token
 * @param {String} userid 传入的 ·管理员/广告商/用户· 的id
 * @return {String} 生成的token
 */
function getToken(userid){
    var result = HMAC_SHA256(HMAC_MD5((userid + new Date().getTime()),passwdmd5),passwd256).toString();
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


exports.getToken = getToken;
exports.Query_EqualTo =  Query_EqualTo;