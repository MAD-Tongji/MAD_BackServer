/**
 * Created by Administrator on 2016/4/20.
 */
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('here is admin');
});
/* GET/POST lister*/
// router.get('/login',function (req,res,next) {
//   //code here
// })

module.exports = router;
