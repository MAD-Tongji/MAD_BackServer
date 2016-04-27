var wilddog = require('wilddog');
var rootRef = new wilddog("https://wild-boar-00060.wilddogio.com/");
var userRef = rootRef.child('user');
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