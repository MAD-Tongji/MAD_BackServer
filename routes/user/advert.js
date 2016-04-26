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
                var adlist = snap.val().adUsedList;
                for(var i = 0; i < adlist.length; i++)
                {
                    var adDetailRef = adRef.child(adlist[i]);
                    // adDetailRef.
                }
                result.adUsedList = adlist;
            }
            res.json(result);
        });
    }
    
    // res.json(result);  
}

exports.getAllAdUsed = getAllAdUsed;

