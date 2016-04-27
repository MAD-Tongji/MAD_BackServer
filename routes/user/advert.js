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
    var token = req.query.token || null;
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
                // result.adUsedList = adlist;
            }
            res.json(result);
        });
    }
    
    // res.json(result);  
}

exports.getAllAdUsed = getAllAdUsed;

/**
 * @interface
 * @description {interface} 获取广告详情
 */
function getDetail(req,res) {
    var adid = req.params.adid;
    var result = new Object;
    result.detail = utils.getAdDetail(adid) || null;
    result.errCode = 0;
    res.json(result);
}

exports.getDetail = getDetail;


function setFilter(req,res) {
    var filterArray = req.body.adValidationSettings;
    var token = req.body.token;
    var userId = utils.token2id(token);
    if (userId == null)
    {
        res.json({errCode:101});
    }
    else if(filterArray.length != 9)
    {
        res.json({errCode:999,errMessage:"filterArray不合规范"});
    }
    else
    {
        var ref = userRef.child(userId).child('filter');
        ref.once('value',(snap)=>{
            if(snap.val() == null)
            {
                res.json({errCode:999,errMessage:"找不到filter"});
            }
            else
            {
                ref.set({
                    accommodation : filterArray[0],
                    commodity : filterArray[1],
                    education : filterArray[2],
                    entertainment : filterArray[3],
                    other : filterArray[4],
                    recruit : filterArray[5],
                    service : filterArray[6],
                    social : filterArray[7],
                    tenancy : filterArray[8],
                },
                (err)=>{
                    if(err!=null)
                    {
                        res.json({errCode:999,errMessage:"修改filter失败，严重错误"});
                    }
                    else
                    {
                        var result = new Object;
                        result.errCode = 0;
                        // result.filterArray =filterArray;
                        res.json(result);
                    }
                });
            }
        });
    }
}

exports.setFilter = setFilter;