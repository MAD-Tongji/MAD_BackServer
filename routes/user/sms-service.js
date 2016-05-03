/// <reference path="../../typings/node/node.d.ts" />
var wilddog = require('wilddog');
var SMSAPP = require('alidayu-node');
var smsServer = new SMSAPP('23332080','e491e9f8f913e21cf1e4e8ac05c46ce1');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');

/**
 * @description 阿里大鱼短信平台发送验证码并且在野狗中记录
 * @param {String} phonenum 要发送短信的手机号
 * @returns void
 */
function sendValidationCode(phonenum)
{
    var code = 0;
    while (code <= 100000)
    {
        code = Math.floor(Math.random()*1000000);
    }
    var obj = new Object;
    obj[phonenum] ={
        code:code,
        timeStamp:wilddog.ServerValue.TIMESTAMP
    };
    ref.child('phone-VCode').update(obj);
    smsServer.smsSend({
        sms_type:'normal',
        sms_free_sign_name:'身份验证',
        sms_param:'{"code":"'+code.toString()+'","product":"MAD"}',
        rec_num:phonenum,
        sms_template_code:'SMS_6735070'
    });
    console.log('sms sended');
}

exports.sendValidationCode = sendValidationCode;

/**
 * @description验证验证码是否正确
 * @param {String} phonenum手机号
 * @param {Number} vcode验证码
 * @returns {Boolean} 是否通过验证 
 */
function validateVCode (phonenum,vcode)
{
    var vcodeRef = ref.child('phone-VCode').child(phonenum);
    vcodeRef.once('value',(snap)=>{
        if(snap.val() == null)
        {
            return false;
        }
        var code = snap.val().code;
        var timeStamp = snap.val().timeStamp;
        if(vcode != code) return false;
        else if(new Date().getTime() - timeStamp > 5*60*1000) return false;
        else return true;
    });
    
}
exports.validateVCode = validateVCode;