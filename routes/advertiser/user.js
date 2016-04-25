/**
 * Created by Teng on 2016/4/25.
 */

var memcached = require('memcached');
var wilddog = require('wilddog');
var advertiserRef = new wilddog('https://wild-boar-00060.wilddogio.com/advertiser');


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

exports.login = login;
exports.signup = signup;
