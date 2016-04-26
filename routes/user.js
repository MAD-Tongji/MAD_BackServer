var express = require('express');
var router = express.Router();
var test = require('./user/ExportFunctionDemo');
var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
var user=require('./user/methods.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  	ref.once('value',(snap)=>{
    	console.log(snap.val());
  	});
   
  	test.b(function(){
    	console.log('this is callback function');
  	});
  	res.send('here is user');
});
/* GET/POST lister*/
// router.get('/login',function (req,res,next) {
//   //code here
// })

/* user login interface */
router.post('/login',user.login);

/* user register interface */
router.post('/register',user.register);

/* user find password interface */
router.post('/findpwd',user.findpwd);

/* user alter password interface */
router.post('/alterpwd',user.alterpwd);

/* user get message list interface */
// router.post('/msglist',user.msglist);

module.exports = router;
