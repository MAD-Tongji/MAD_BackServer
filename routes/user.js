var express = require('express');
var router = express.Router();
var test = require('./user/ExportFunctionDemo');
var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
/* GET users listing. */
router.get('/', function(req, res, next) {
  ref.once('value',(snap)=>{
    console.log(snap.val());
  });
  test.a();
  test.b(function(){
    console.log('this is callback function');
  });
  res.send('here is user');
});
/* GET/POST lister*/
// router.get('/login',function (req,res,next) {
//   //code here
// })

module.exports = router;
