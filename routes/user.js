var express = require('express');
var router = express.Router();
var test = require('./user/ExportFunctionDemo');

/* GET users listing. */
router.get('/', function(req, res, next) {

  test.a();
  test.b();
  res.send('here is user');
});
/* GET/POST lister*/
// router.get('/login',function (req,res,next) {
//   //code here
// })

module.exports = router;
