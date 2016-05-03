/// <reference path="../../typings/node/node.d.ts" />
var wilddog = require('wilddog');
var SMSAPP = require('alidayu-node');
var smsServer = new SMSAPP('23332080','e491e9f8f913e21cf1e4e8ac05c46ce1');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');

/**
 * @description 阿里大鱼短信平台发送验证码并且在野狗中记录
 * @param {String} phonenum 要发送短信的手机号
 */
function sendValidationCode(phonenum)
{
    var phonenum = req.body.phonenum;
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
    // res.send('sms sended');
}

exports.sendValidationCode = sendValidationCode;