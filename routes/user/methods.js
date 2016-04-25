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













