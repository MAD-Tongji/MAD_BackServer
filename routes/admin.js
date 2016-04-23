var express = require('express');
var router = express.Router();
var admin = require('./admin/methods');

/* GET admin listing. */
router.get('/', function(req, res, next) {
    res.send('here is admin');
});

/* Login interface*/
router.post('/back/login', admin.login);

router.get('/back/backuser/list', admin.backuserList)

router.get('/back/user/list', admin.userList);


module.exports = router;