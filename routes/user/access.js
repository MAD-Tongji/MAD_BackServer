var Token = require('../../lib/publicUtils');
var User=require('./user');
var wilddog = require('wilddog');
var rootRef = new wilddog("https://wild-boar-00060.wilddogio.com/");
var userRef = rootRef.child('user');
var adRef = rootRef.child('advertisment');
var tokenRef=rootRef.child('token2id');


/**
 * @interface
 * @description {interface} 用户登录，参数为用户名，密码
 */
exports.login=function(req,res) {
    var username=req.body.username;
    var password=req.body.password;
    //console.log(username,req.params,req.body);
    var result={};
    if(username==null|| password==null){
        result.errCode=102;
        res.json(result);
    }
    else{
        var ref=userRef.child(username);
        ref.once('value',function(snapshot) {
            if(snapshot.val().password==password){
                result.errCode=0;
                result.userId=username;
                result.token=Token.getToken(result.userId);
                res.json(result);
            }else{
                result.errCode=102;
                res.json(result);
            }
        })
        // userRef.orderByChild('name').equalTo(username).on('value',function(snapshot) {
        //     console.log(snapshot.key());
        //     result.errCode=0;
        //     result.token=
        // });
    }
}


/**
 * @interface
 * @description {interface} 用户注册，参数为用户名，密码
 */
exports.register=function(req,res) {
    var username=req.body.username;
    var password=req.body.password;
    //console.log(username,req.params,req.body);
    var result={};
    if(username==null|| password==null){
        result.errCode=102;
        res.json(result);
    }
    else{
        // var userList=[];
        // userRef.once('value',function(snapshot) {
        //     userList=snapshot.val();
            
        // });
        var newUser={};
        newUser[username]={
            name:username,
            password:password
        };
        userRef.update(newUser);
        result.errCode=0;
        result.token=Token.getToken(username);
        result.userId=username;
        res.json(result);
    }
}



/**
 * @interface
 * @description {interface} 用户找回密码，参数为手机号，新密码，验证码
 */
exports.findpwd=function(req,res) {
    var phoneNumber=req.body.phoneNumber;
    var newpwd=req.body.newpwd;
    var validationCode=req.body.validationCode;
    var theValidation=111111;
    if(validationCode==theValidation){
        var pwdRef=userRef.child(phoneNumber);
        pwdRef.update({
            'password':newpwd
        });
        res.json({
            errCode:0
        });
    }
    else{
        res.json({
            errCode:103
        })
    }
}



/**
 * @interface
 * @description {interface} 用户修改密码，参数为旧密码，新密码，会话令牌
 */
exports.alterpwd=function(req,res) {
    var oldPassword=req.body.oldPassword;
    var newPassword=req.body.newPassword;
    var token=req.body.token;
    var currentToken=tokenRef.child(token);
    var id;
    currentToken.once('value',function(snapshot) {
        id=snapshot.val();
        console.log(id);
        
        var ref=userRef.child(id);
    
        ref.once('value',function(snapshot) {
            var dogPassword=snapshot.val().password;
            if (dogPassword==oldPassword) {
                ref.update({
                    'password':newPassword
                });
                res.json({
                    errCode:0
                })
            }
            else{
                res.json({
                    errCode:103
                })
            }
        })
    });
    //var id=tokenRef.child(token).val();
    console.log(id);
   
}


/**
 * @interface
 * @description {interface} 获取消息列表
 */
exports.msglist=function(req,res) {
    
}