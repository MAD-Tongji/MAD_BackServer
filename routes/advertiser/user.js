/**
 * Created by Teng on 2016/4/25.
 */

var memcached = require('memcached');
var wilddog = require('wilddog');
var advertiserRef = new wilddog('https://wild-boar-00060.wilddogio.com/advertiser');
var q = require('q');


// 参考文档https://z.wilddog.com/web/crud#cha-xun-shu-ju0
function login(){
    //测试如何使用
    advertiserRef.child('hereIsAdvertiserId').on('value', 
        function (datasnapshot) {
            console.log(datasnapshot.val());
        }, function (errorObject) {
            console.log('The read failed: ' + errorObject.code);
    });
    
    //匹配密码
    advertiserRef.orderByChild('password').equalTo('123456').on("child_added", function(snapshot) {
        console.log(snapshot.key());
    });
}

function signup() {
    //新建广告商
    //这里如何回调？
    advertiserRef.child('newAdvertiserId').set({
        //初始化数据
        Alipay: "String",
        advertisment: {},
        balance: 0,
        currentBroadcast: 0,
        detail: {},
        email: "test@test.com",
        expiration: "",
        message: {},
        name: "String",
        password: "123456",
        recharge: {},
        refund: {},
        status: false,
        token: "生成随机token"
    });
}



/******** 我是分割线 **********/

function getAccountDetail(id) {
    var defer = q.defer();
    var user;
    advertiserRef.child(id).on("value", function(snapshot) {
        user = {
            name: snapshot.val().name,
            id: snapshot.val().id,
            status: snapshot.val().status,
            email: snapshot.val().email,
            alipay: snapshot.val().Alipay
        }
        console.log(user);
        defer.resolve(user);
        //user["avatar"] = snapshot.val().avatar;  //数据库缺失,需要补
    });
    //defer.resolve(user);
    return defer.promise;
}

// 导出
exports.login = login;
exports.signup = signup;
exports.getAccountDetail = getAccountDetail;