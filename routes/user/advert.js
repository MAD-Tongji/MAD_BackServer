var wilddog = require('wilddog');
var rootRef = new wilddog("https://wild-boar-00060.wilddogio.com/");
var userRef = rootRef.child('user');
var adRef = rootRef.child('advertisment');

/**
 * @interface
 * @description {interface} 获取用户已接广告
 */
function getAllAdUsed(req,res) {
    var userid = req.params.userid || null;
    var token = req.body.token || null;
    var result = new Object;
    if(userid == null || token == null)
    {
        result.errCode = 100;
        res.json(result);
    }
    else
    {
        var ref = userRef.child(userid) || null;
        ref.once('value',(snap)=>{
            if(snap.val() == null)
            {
                result.errCode = 100;
                result.message = '账户不存在';
            }
            else{
                console.log(snap.val().detail.VIN);
                for(var i = 0; i < snap.val().adUsedList.length; i++)
                {
                    console.log(snap.val().adUsedList[i]);
                }
                result.adUsedList = snap.val().adUsedList;
            }
            res.json(result);
        });
    }
    
    // res.json(result);  
}

exports.getAllAdUsed = getAllAdUsed;

