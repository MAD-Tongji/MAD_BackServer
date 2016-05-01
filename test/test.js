var supertest = require('supertest');
var should = require('should');

var server = supertest.agent("http://localhost:3000");

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
	it("2./back/backuser/list : should return all back users", function(done) {
		server
		.get('/back/backuser/list')
		.query({
			'token': '506902848235ee96192b0454850aed83a5a1fe1a56e4be8a664eeb374e7aa37f' // ！！！每次登录换token会使这个测试用例的token过期
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
	
})