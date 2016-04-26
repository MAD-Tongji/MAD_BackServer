var Token = require('../../lib/publicUtils');
var User=require('./user');

exports.login=function (req,res,next) {
    var data=req.body;
    User.login(data,function name(err,user) {
        if(err) return next(err);
        if(user) {
            var token=Token.getToken(user.id);
            var adminId=Token;//这里需要得到adminID
            res.json({
                token:token,
                errCode:0,
                adminId:adminId
            });
        }else{
            res.json({
                errCode:104//用户名或密码不正确
            });
        }
    })
}  

exports.register=function(req,res,next) {
    var data=req.body;
    User.register(data,function(err,user) {
        if (err) return next(err);
        if (user) {
            var token=Token.getToken(user.id);
            var userId=user.id;
            res.json({
               errCode:0,
               token:token,
               userId:userId 
            });
        }else{
            res.json({
                errCode:104//注册失败
            })
        }
    })
}

exports.findpwd=function(req,res,next) {
    var data=req.body;
    User.findpwd(data,function(err,result) {
        if(err) return next(err);
        if (result) {
            res.json({
                errCode:0
            })
        }else{
            res.json({
                errCode:104//找回密码失败
            })
        }
    })
}

exports.alterpwd=function(req,res,next) {
    var data=req.body;
    User.alterpwd(data,function(err,result) {
        if(err) return next(err);
        if (result) {
            res.json({
                errCode:0
            })
            
        }else{
            res.json({
                errCode:104//修改密码失败
            })
        }
    })
}

exports.msglist=function(req,res) {
    var userId=req.query.userId;
    var token=req.query.token;
    User.msglist(userId,token,function(err,result) {
        if(err) return next(err);
        if(result){
            var msglist=result.msglist;
            res.json({
                errCode:0,
                messageList:[
                    {
                    id:msgid,
                    pushTime:msgdate,
                    content:msgcont,
                    status:readbl
                    }
                ]
            })
        }else{
            res.json({
                errCode:104
            })
        }
    })
}











