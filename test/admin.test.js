var supertest = require('supertest');
var should = require('should');

var server = supertest.agent("http://localhost:3000");

/**
 * Part One: Back module
 */

describe("Back module interfaces testing:", function() {
	/* POST mothod example */
	// it("1./back/login : should return a token", function(done) {
	// 	server
	// 	.post('/back/login')
	// 	.send({
	// 		'name': 'admin',
	// 		'pass': '12345678'
	// 	})
	// 	.expect('Content-Type', /json/)
	// 	.expect(200)
	// 	.end(function(err, res) {
	// 		if (err) throw err;
	// 		res.status.should.equal(200);
	// 		res.body.errCode.should.equal(0);
	// 		console.log('token: ' + res.body.token);
	// 		done();
	// 	})
	// })
	/* GET method example */
	/* ！！！每次登录换token会使之后的测试用例的token过期！！！所以使用上一次登录生成的token，并注释掉登录代码 */
	it("2./back/backuser/list : should return all back users", function(done) {
		server
		.get('/back/backuser/list')
		.query({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f'
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})

	it("3./back/user/list : should return all car users", function(done) {
		server
		.get('/back/user/list')
		.query({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'tag': '1'
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})

	it("4./back/user/list : should return all advertiser users", function(done) {
		server
		.get('/back/user/list')
		.query({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'tag': '2'
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})

	it("5./back/backuser/create : should return errCode = 0", function(done) {
		server
		.post('/back/backuser/create')
		.send({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
    		'userName': 'Tom',
    		'email': 'tom@tongji.com',
    		'gender': 'male',   
    		'level': '2',
    		'hireDate': (new Date()).toString().substr(0, 24)
		})
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})

	it("6./back/backuser/manage : should return errCode = 0", function(done) {
		server
		.post('/back/backuser/manage')
		.send({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
		    'id': '1',
    		'newLevel': '3'
		})
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})

	it("7./back/backuser/modify : should return errCode = 0", function(done) {
		server
		.post('/back/backuser/modify')
		.send({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
		    'id': '1',
    		'email': 'newEmail@tongji.com',
    		'password': 'newpassword'
		})
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})

	it("8./back/user/detail/:userid : should return a car user detail with specified id", function(done) {
		server
		.get('/back/user/detail/:userid')
		.query({
			'userid': 'userId2',
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'tag': '1'
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})

	it("9./back/user/detail/:userid : should return a advertiser detail with specified id", function(done) {
		server
		.get('/back/user/detail/:userid')
		.query({
			'userid': 'test2@test-com',
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'tag': '2'
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})

	it("10./back/user/audit : should return a verify result", function(done) {
		server
		.post('/back/user/audit')
		.send({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'id': 'userId2',
			'tag': '1',
			'success': '0',
			'reason': 'xxxxxxx'
		})
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})
	
	it("11./back/advert/submit : should return errCode = 0 and an id", function(done) {
		server
		.post('/back/advert/submit')
		.send({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'title': '',
			'content': '',
			'catalog': '',
			'broadcastLocation': '',
			'startDate': '',
			'endDate': ''
		})
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			console.log('id: ' + res.body.id);
			done();
		})
	})
	
	it("12./back/advert/save : should return errCode = 0 and an id", function(done) {
		server
		.post('/back/advert/save')
		.send({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'title': '',
			'content': '',
			'catalog': '',
			'broadcastLocation': '',
			'startDate': '',
			'endDate': ''
		})
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			console.log('id: ' + res.body.id);
			done();
		})
	})
	
	it("13./back/advert/list/all : should return all advertisement", function(done) {
		server
		.get('/back/advert/list/all')
		.query({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'tag': '0'
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})
	
	it("14./back/advert/list/all : should return all advertisement which were not verified", function(done) {
		server
		.get('/back/advert/list/all')
		.query({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'tag': '1'
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})
	
	it("15./back/advert/audit : not pass advertisement, should return errCode = 0", function(done) {
		server
		.post('/back/advert/audit')
		.send({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'id': '',
			'success': '0'
		})
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})
	
	it("16./back/advert/audit : pass advertisement, should return errCode = 0", function(done) {
		server
		.post('/back/advert/audit')
		.send({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'id': '',
			'success': '1'
		})
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})
	
	it("17./back/advert/detail/:id : should return a advertisement detail with specified id", function(done) {
		server
		.get('/back/advert/list/all')
		.query({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'id': ''
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})
	
	it("18./back/advert/remove : should return errCode = 0", function(done) {
		server
		.post('/back/advert/remove')
		.send({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'id': '',
			'reason': 'xxxxxxx'
		})
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})
	
	it("19./back/account/list : should return a account list", function(done) {
		server
		.get('/back/account/list')
		.query({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f'
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})
	
	it("20./back/account/apply/list : should return an advertiser recharge list", function(done) {
		server
		.get('/back/account/apply/list')
		.query({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'catalog': '1'
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})
	
	it("21./back/account/apply/list : should return an advertiser refund list", function(done) {
		server
		.get('/back/account/apply/list')
		.query({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'catalog': '2'
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})
	
	it("22./back/account/apply/list : should return an car user withdrawal list", function(done) {
		server
		.get('/back/account/apply/list')
		.query({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'catalog': '3'
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})
	
	it("23./back/account/apply/complete : should return errCode = 0", function(done) {
		server
		.post('/back/account/apply/complete')
		.send({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f',
			'operatorEmail': '',
			'operatorPassword': 'xxxxxxx',
			'applyId': ''
		})
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})
	
	it("24./back/message/list : should return an car user withdrawal list", function(done) {
		server
		.get('/back/message/list')
		.query({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f'
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			done();
		})
	})
})