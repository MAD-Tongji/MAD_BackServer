var express = require('express');
var router = express.Router();
var admin = require('./admin/user');
var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
/* GET admin listing. */
router.get('/', function(req, res, next) {
    res.send('here is admin');
});

/* Login interface*/
router.post('/back/login', admin.login);

module.exports = router;