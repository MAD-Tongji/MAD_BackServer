/**
 * Created by mandyxue on 16/5/5.
 */

var memcached = require('memcached');
var Q = require('q');
var wilddog = require('wilddog');
var Token = require('../../lib/publicUtils');
var applyRef = new wilddog('https://wild-boar-00060.wilddogio.com/apply');
var advertiserRef = new wilddog('https://wild-boar-00060.wilddogio.com/advertiser');
var q = require('q');
var moment = require('moment');

module.exports = Apply;

function Apply(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}

/**
 * 新建一个申请
 * @param applyId 申请在user端的id
 * @param userId  user的id
 * @param type    申请类型,recharge/refund
 * @returns {*|promise}
 */
Apply.createApplyById = function(applyId, userId, type){
    var deferred = Q.defer();
    var catalog;
    if (type === "recharge") {
        catalog = 1;
    } else if (type === "refund"){
        catalog = 2;
    } else {
        deferred.reject();
    }
    // 获取广告商
    var user = advertiserRef.child(userId);

    user.once("value", function (snapshot1) {
        var userName = snapshot1.val().name;
        // 判断节点是否存在
        if (snapshot1.child(type).child(applyId).exists()) {
            user.child(type).child(applyId).once("value", function (snapshot) {
                // 获取refund或recharge数据
                var apply = snapshot.val();
                // 更新apply表
                applyRef.push({
                    account: apply.account,
                    applyDate: apply.time,
                    catalog: catalog,
                    completedDate: "null",
                    money: apply.amount,
                    operatorName: "null",
                    status: "01",
                    userId: userId,
                    userName: userName,
                    applyId: applyId
                });
                deferred.resolve(apply);
            })
        } else {
            deferred.reject();
        }
    });

    return deferred.promise;
};