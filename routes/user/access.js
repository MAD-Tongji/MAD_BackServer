var Token = require('../../lib/publicUtils');
var User=require('./user');
var wilddog = require('wilddog');
var rootRef = new wilddog("https://wild-boar-00060.wilddogio.com/");
var userRef = rootRef.child('user');
var adRef = rootRef.child('advertisment');
var tokenRef=rootRef.child('token2id');
var validate=require('../user/sms-service');

/**
 * @interface
 * @description {interface} 用户登录，参数为用户名，密码
 */
exports.login=function(req,res) {
    var username=req.body.username;
    var password=req.body.password;
    console.log(username,req.params,req.body);
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
    var name=req.body.name;
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
            adUsedList:[],
            alipay:'',
            balance:0,
            detail:{
              VIN:'',
              email:'',
              gender:true,
              vehicleFrontImage:'',
              vehicleLicenseImage :'' 
            },
            expiration:'',
            filter:{
              accommodation:'',
              commodity:'',
              education:'',
              entertainment:'',
              other:'',
              recruit:'',
              service:'',
              social:'',
              tenancy:''  
            },
            message:[],
            mobilePhone:username,
            name:name,
            password:password,
            playTimes:0,
            statistics:{
                day:[],
                hour:[],
                mouth:[],
                totalCash:0,
                totalIncome:0
            },
            status:true
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
    console.log(phoneNumber,newpwd,validationCode);
    //var theValidation=111111;
    if(validate.validateVCode(phoneNumber,validationCode)){
        console.log('validate success');
        var pwdRef=userRef.child(phoneNumber);
        pwdRef.update({
            'password':newpwd
        });
        res.json({
            errCode:0
        });
    }
    else{
        console.log('validate error');
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
    var oldPassword=req.body.oldPassword||null;
    var newPassword=req.body.newPassword||null;
    var token=req.body.token;
    var currentToken=tokenRef.child(token);
    var id;
    currentToken.once('value',function(snapshot) {
        id=snapshot.val();
        console.log(id);
        
        var ref=userRef.child(id)||null;
    
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
    var userId=req.params.userid;
    var token=req.body.token;
    var result={};
    console.log(userId);
    if(userId==null||token==null){
        result.errCode=100;
        res.json(result);
    }else{
        var ref=userRef.child(userId)||null;
        ref.once('value',function(snapshot) {
            if(snapshot.val()==null){
                result.errCode=101;
            }
            else{
                var msglist=snapshot.val().message;
                result.errCode=0;
                result.messageList=msglist;
            }
             res.json(result);
        })
    }
}

/**
 * @interface
 * @description {interface} 发送验证码
 */

exports.sendValidate=function(req,res) {
    var phoneNumber=req.body.phoneNumber;
    validate.sendValidationCode(phoneNumber);
    var result={
        errCode:0
    };
    res.json(result);
}