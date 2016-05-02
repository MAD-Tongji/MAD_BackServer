var supertest = require('supertest');
var should = require('should');

var server = supertest.agent("http://localhost:3000");
/**
 * Part Three: Advertiser module
 */
	
describe("Advertiser module interfaces testing:", function() {
	// it("1./advertiser/login/ : should return a token", function(done) {
	// 	server
	// 	.post('/advertiser/login/')
	// 	.send({
	// 		'email': '',
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
	
	it("2./advertiser/signup : should return errCode = 0", function(done) {
		server
		.post('/advertiser/signup')
		.send({
			'username': '',
            'email': '',
			'password': ''
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

	it("3./advertiser/advertisement/list/all : should return errCode = 0", function(done) {
		server
		.get('/advertiser/advertisement/list/all')
		.query({
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

	it("4./advertiser/advertisement/district/all : should return errCode = 0", function(done) {
		server
		.get('/advertiser/advertisement/district/all')
		.query({
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

	it("5./advertiser/advertisement/submit : should return errCode = 0 and a advertisement id", function(done) {
		server
		.post('/advertiser/advertisement/submit')
		.send({
			'token': '',
            'title': '',
            'content': '',
            'catalog': '',
            'broadcastlocation':{
                'district_name1': '',
                'district_name2': ''
            },
            'startdate': '',
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

	it("6.//advertiser/advertisement/save : should return errCode = 0 and a advertisement id", function(done) {
		server
		.post('/advertiser/advertisement/save')
		.send({
			'token': '',
            'title': '',
            'content': '',
            'catalog': '',
            'broadcastlocation':{
                'district_name1': '',
                'district_name2': ''
            },
            'startdate': '',
            'endDate': ''    
		})
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
            console.log('id: ' + res.body.id)
			done();
		})
	})

	it("7./advertiser/advertisement/remove : should return errCode = 0", function(done) {
		server
		.post('/advertiser/advertisement/remove')
		.send({
			'token': '',
			'id': ''
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

	it("8./advertiser/advertisement/:id : should return errCode = 0", function(done) {
		server
		.get('/advertiser/advertisement/:id')
		.query({
			'token': '',
			'id': ''
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

	it("9./advertiser/account/recharge : should return errCode = 0", function(done) {
		server
		.post('/advertiser/account/recharge')
		.send({
			'token': '',
			'recharge': '',
            'Alipay': ''
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

	it("10./advertiser/account/detail : should return errCode = 0", function(done) {
		server
		.get('/advertiser/account/detail')
		.query({
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
	
	it("11./advertiser/account/recharge/all : should return errCode = 0", function(done) {
		server
		.get('/advertiser/account/recharge/all')
		.query({
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
	
	it("12./advertiser/account/refund/all : should return errCode = 0", function(done) {
		server
		.get('/advertiser/account/refund/all')
		.query({
			'token': ''
		})
        .set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(function(err, res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.errCode.should.equal(0);
		})
	})
	
	it("13./advertiser/account/refund : should return errCode = 0", function(done) {
		server
		.post('/advertiser/account/refund')
		.send({
			'token': '',
			'refund': '',
			'Alipay': ''
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
	
	it("14./advertiser/account/check : should return errCode = 0", function(done) {
		server
		.post('/advertiser/account/check')
		.send({
			'token': '',
			'detail': {
                'type': '',
                'licenseType': '',
                'licenseNum': '',
                'companyName': '',
                'licenseCode': '',
                'licenseImageUrl': '',
                'location': '',
                'accomodation': '',
                'businessScope': '',
                'businessPeriod': '',
                'organizationCode': '',
                'legalPerson': {
                    'name': '',
                    'location': '',
                    'id': '',
                    'validDate': '',
                    'iflongterm': '',
                    'iflegalperson': ''
                },
                'contactEmail': ''
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
	
	it("15./advertiser/statistics/detail/:id : should return errCode = 0", function(done) {
		server
		.get('/advertiser/statistics/detail/:id')
		.query({
			'id': '',
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
    
    it("16./advertiser/message : should return errCode = 0", function(done) {
		server
		.get('/advertiser/message')
		.query({
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
    
    it("17./advertiser/time : should return errCode = 0 and time", function(done) {
		server
		.get('/advertiser/time')
		.query({
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