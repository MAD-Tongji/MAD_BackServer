var wilddog = require('wilddog');
var rootRef = new wilddog("https://wild-boar-00060.wilddogio.com/");
var userRef = rootRef.child('user');
var adRef = rootRef.child('advertisment');

var utils = require('../../lib/publicUtils');
/**
 * @interface
 * @description {interface} 获取用户已接广告
 */
function getAllAdUsed(req,res) {
        
    var userid = req.params.userid || null;
    var token = req.body.token || null;
    var result = new Object;
    if(userid == null || token == null || userid != utils.token2id(token))
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
            }
            else{
                var adlist = snap.val().adUsedList;
                var detailArray = new Array();
                for(var i = 0; i < adlist.length; i++)
                {
                    detailArray.push(utils.getAdDetail(adlist[i]));
                }
                result.errCode = 0;
                result.adList=detailArray;
                result.adUsedList = adlist;
            }
            res.json(result);
        });
    }
    
    // res.json(result);  
}

exports.getAllAdUsed = getAllAdUsed;