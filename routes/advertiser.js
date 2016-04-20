var express = require('express');
var router = express.Router();
var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('here is advertiser');
});
/* GET/POST lister*/
// router.get('/login',function (req,res,next) {
//   //code here
// })

module.exports = router;
