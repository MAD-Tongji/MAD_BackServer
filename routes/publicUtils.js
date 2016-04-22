/// <reference path="../typings/node/node.d.ts" />

var HMAC_SHA256 = require('crypto-js/hmac-sha256');
var HMAC_MD5 = require('crypto-js/hmac-md5');

var passwd256 = "c39784d8d3752976e4426b1824c1265d39c87cbf616892b4897e711340a7d0fd";
var passwdmd5 = "4a23fd3b644d9fd8b75d45bd64818188c425011f4bd9b5b4eab24cef49d29949";

/**
 * @description 输入userid加密得到token
 * @param {String} userid 传入的 ·管理员/广告商/用户· 的id
 * @return {String} 生成的token
 */
function getToken(userid){
    var result = HMAC_SHA256(HMAC_MD5((userid + new Date().getTime()),passwdmd5),passwd256).toString();
    return result;
}

exports.getToken = getToken;