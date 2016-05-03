var supertest = require('supertest');
var should = require('should');

var server = supertest.agent("http://localhost:3000");
/**
 * Part Two: Car user module
 */
	
describe("Car user module interfaces testing:", function() {
	// it("1./mobile/login : should return a token", function(done) {
	// 	server
	// 	.post('/mobile/login')
	// 	.send({
	// 		'username': '',
	// 		'password': ''
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
	
	/* ！！！每次登录换token会使之后的测试用例的token过期！！！所以使用上一次登录生成的token，并注释掉登录代码 */
	
	it("2./mobile/register : should return errCode = 0 and a token", function(done) {
		server
		.post('/mobile/register')
		.send({
			'username': '',
			'password': ''
		})
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
            console.log('token: ' + res.body.token);
			done();
		})
	})

	it("3./mobile/findpwd : should return errCode = 0", function(done) {
		server
		.post('/mobile/findpwd')
		.send({
			'phoneNumber': '',
			'validationCode': ''
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

	it("4./mobile/alterpwd : should return errCode = 0", function(done) {
		server
		.post('/mobile/alterpwd')
		.send({
			'oldPassword': '',
			'newPassword': '',
			'token': ''
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

	it("5./mobile/advert/all/:userid : should return errCode = 0", function(done) {
		server
		.get('/mobile/advert/all/:userid')
		.query({
			'userId': '',
			'token': ''
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

	it("6./mobile/advert/detail/:adid : should return errCode = 0", function(done) {
		server
		.get('/mobile/advert/detail/:adid')
		.query({
			'adId': ''
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

	it("7./mobile/advert/filter : should return errCode = 0", function(done) {
		server
		.post('/mobile/advert/filter')
		.send({
			'adValidationSettings': '',
			'token': ''
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

	it("8./mobile/account/withdraw : should return errCode = 0", function(done) {
		server
		.post('/mobile/account/withdraw')
		.send({
			'token': '',
			'number': '',
			'account': ''
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

	it("9./mobile/account/:userid : should return errCode = 0", function(done) {
		server
		.get('/mobile/account/:userid')
		.query({
			'userId': '',
			'token': ''
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

	it("10./mobile/withdraw/:userid : should return errCode = 0", function(done) {
		server
		.get('/mobile/withdraw/:userid')
		.query({
			'userId': '',
			'token': ''
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
	
	it("11./mobile/check/submit : should return errCode = 0", function(done) {
		server
		.post('/mobile/check/submit')
		.send({
			'token': '',
			'userID': '',
			'check': {
				'name': '',
				'vehicleLicense': '',
				'VIN': '',
				'vehicleLicensePicture': '',
				'carPicture': ''
			}
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
	
	it("12./mobile/licensepic/submit : should return errCode = 0 and picture URL", function(done) {
		server
		.post('/mobile/licensepic/submit')
		.send({
			'token': '',
			'userID': '',
			'vehicleLicensePicture': ''
		})
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			console.log('url: ' + res.body.vehicleLicensePictureUrl);
			done();
		})
	})
	
	it("13./mobile/carpic/submit : should return errCode = and picture URL", function(done) {
		server
		.post('/mobile/carpic/submit')
		.send({
			'token': '',
			'userID': '',
			'carPicture': ''
		})
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
			console.log('url: ' + res.body.carPictureUrl);
			done();
		})
	})
	
	it("14./mobile/account/modify : should return errCode = 0", function(done) {
		server
		.post('/mobile/account/modify')
		.send({
			'token': '',
			'userID': '',
			'newInfo': ''
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
	
	it("15./mobile/msglist/:userid : should return errCode = 0", function(done) {
		server
		.get('/mobile/msglist/:userid')
		.query({
			'userId': '',
			'token': ''
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