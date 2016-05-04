var wilddog = require('wilddog');
var rootRef = new wilddog("https://wild-boar-00060.wilddogio.com/");
var userRef = rootRef.child('user');
var token2id
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
        result.errCode = 100;
        res.json(result);
    }
    else
    {
        var ref = userRef.child(userid);
        if(newInfo != null)
        ref.update(newInfo);
        res.json({errCode:0});
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
    
    if(account == null || token == null || account != utils.token2id(token))
    {
        result.errCode = 100;
        res.json(result);
    }
    else
    {
        var ref = userRef.child(account);
        res.json({errCode:0});
    }
}

exports.drawMoney = drawMoney;


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
                    vehicleLicensePicture:infos.vehicleLicensePicture
                };
                res.json(result);
            }
        })
       
    }
}

exports.accountInfo = accountInfo;


