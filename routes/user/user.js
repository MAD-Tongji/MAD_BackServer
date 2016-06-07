var wilddog = require('wilddog');
var rootRef = new wilddog("https://wild-boar-00060.wilddogio.com/");
var userRef = rootRef.child('user');
var moment=require('moment');
// var adRef = rootRef.child('advertisment');

var utils = require('../../lib/publicUtils');

/**
 * @interface
 * @description {interface} 修改用户信息
 */
function modifyInfo(req,res)
{
    var userid = req.body.userId || null;
    var token = req.body.token || null;
    var newInfo = req.body.newInfo || null;
    var result = new Object;
    console.log(token);
    console.log(utils.token2id(token));
    console.log(userid);
    if(userid == null || token == null || userid != utils.token2id(token))
    {
        result.errCode = 101;
        res.json(result);
    }
    else
    {
        var ref = userRef.child(userid);
        ref.once('value',(snap)=>{
            if(snap.val()==null){
                result.errCode = 101;
                res.json(result);
            }else{
                if(newInfo != null){
                    ref.update(newInfo);
                    res.json({errCode:0});
                }else{
                    res.json({errCode:108});
                }
            }
        });
    }
}

exports.modifyInfo = modifyInfo;


/**
 * @interface
 * @description {interface} 账户提款
 */
function drawMoney(req,res)
{
    var account = req.body.account || null;
    var token = req.body.token || null;
    var number = req.body.number || null;
    var result = new Object;
    console.log(req.body);
    if(number < 0){
        result.errCode = 99;
        res.json(result);
        return;
    }
    if(account == null || token == null || account == '' || token=='' || utils.token2id(token)==null)
    {
        // console.log(utils.token2id(token));
        result.errCode = 100;
        res.json(result);
        return;
    }
    else
    {
        var ref = userRef.child(utils.token2id(token));
        var balance = ref.child('balance');
        var drawRecord=ref.child('withdrawHistory');
        var apply=rootRef.child('apply');
        var newBalance;
        balance.once('value',function(snapshot) {
            console.log(snapshot.val());
            if(snapshot.val() < number){
                result.errCode = 98;
                res.json(result);
                return;
            }else{
                newBalance=parseInt(snapshot.val())-parseInt(number);
                console.log(newBalance);
                ref.update({'balance':newBalance});
                var newRecord=drawRecord.push({
                        alipay:account,
                        number:number,
                        time:moment().format('YYYY-MM-DD h:mm:ss'),
                        status:'01'
                });
                apply.push({
                    account:account,
                    applyDate:moment().format('YYYY-MM-DD h:mm:ss'),
                    applyId:newRecord.key(),
                    catalog:'1',
                    completeDate:'null',
                    money:number,
                    operatorName:'null',
                    status:'01',
                    userId:account,
                    userName:'string'
                });
                result.errCode = 0;
                res.json(result);
                return;
            }
        });
    }
}

exports.drawMoney = drawMoney;


/**
 * @interface
 * @description {interface} 获取提款信息
 */
function drawRecord(req,res)
{
    var userId = req.params.userId || null;
    var token = req.query.token || null;
    //var number = req.body.number || null;
    var result = {};
    console.log(req.query);

    if( userId == null || token == null || userId != utils.token2id(token))
    {
        result.errCode = 100;
        res.json(result);
    }
    else
    {
        var history=[];
        var ref = userRef.child(userId);
        var historyRef=ref.child('withdrawHistory');
        historyRef.orderByKey().once('value',function(snapshot) {
            console.dir(snapshot.val());
            for(var k in snapshot.val()){
                history.push(snapshot.val()[k]);
            }
            res.json({
                errCode:0,
                withdrawHistory:history
            });
        });
        //res.json({errCode:0});
    }
}

exports.drawRecord = drawRecord;

/**
 * @interface
 * @description {interface} 提交信息
 */
function submitInfo(req,res)
{
    var userId = req.body.userId || null;
    var token = req.body.token || null;
    var check = req.body || null;
    var result = {};
    console.log(req.body);
    console.log(req.body.check);
    if(userId == null || token == null || userId != utils.token2id(token))
    {
        result.errCode = 100;
        res.json(result);
    }
    else
    {
        var ref = userRef.child(userId);
        ref.once('value',function(snapshot) {
            var snap=snapshot.val();
            snap.name=check.name;
            snap.detail.VIN=check.VIN;
            snap.detail.vehicleLicense=check.vehicleLicense;
            snap.detail.vehicleFrontImage=check.carPicture;
            snap.detail.vehicleLicenseImage=check.vehicleLicensePicture;
            ref.update(snap);
            res.json({
                errCode:0
            })
        });
        //res.json({errCode:0});
    }
}

exports.submitInfo = submitInfo;

/**
 * @interface
 * @description {interface} 修改用户信息
 */
function changeInfo(req,res)
{
    var userId = req.body.userId || null;
    var token = req.body.token || null;
    var newInfo = req.body.newInfo || null;
    var result = {};
    console.log(req.body);

    if(userId == null || token == null || userId != utils.token2id(token))
    {
        result.errCode = 100;
        res.json(result);
    }
    else
    {
        var ref = userRef.child(account);
        //ref.update()
        res.json({errCode:0});
    }
}

exports.changeInfo = changeInfo;


/**
 * @interface
 * @description {interface} 获取账户信息
 */
function accountInfo(req,res)
{
    var userId = req.params.userId || null;
    var token = req.query.token || null;
   // var number = req.body.number || null;
    var result = new Object;
    console.log(req.params);
    console.log(req.query);

    if(userId == null || token == null || userId != utils.token2id(token))
    {
        console.log('!=');
        result.errCode = 100;
        res.json(result);
    }
    else
    {
        console.log('=');
        var ref = userRef.child(userId)||null;
        ref.once('value',function(snapshot){
            if (snapshot.val()==null) {
                result.errCode=101;
                res.json(result);
            }else{
                var snap=snapshot.val();
                var infos=snapshot.val().detail;
                result={
                    errCode:0,
                    name:snap.name,
                    status:snap.status,
                    mobilePhone:snap.mobilePhone,
                    email:infos.email,
                    gender:infos.gender,
                    address:infos.address,
                    VIN:infos.VIN,
                    license:infos.vehicleLicense || '',
                    vehicleLicensePicture:infos.vehicleLicenseImage
                };
                res.json(result);
            }
        })

    }
}

exports.accountInfo = accountInfo;


/**
 * @interface
 * @description {interface} 更新用户信息
 */
function changeInfo(req,res)
{
    var userId = req.body.userId || null;
    var token = req.body.token || null;
    var newInfo = req.body.newInfo || null;
    var result = {};
    console.log(req.body);

    if(userId == null || token == null || userId != utils.token2id(token))
    {
        result.errCode = 100;
        res.json(result);
    }
    else
    {
        var ref = userRef.child(account);
        //ref.update()
        res.json({errCode:0});
    }
}

exports.changeInfo = changeInfo;

