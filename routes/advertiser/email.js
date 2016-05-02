var nodemailer = require('nodemailer');

module.exports = Email;

function Email(obj) {
  	for (var key in obj) {
    	this[key] = obj[key];
  	}
}

var smtpTransport = nodemailer.createTransport('smtp://mad_advertisement@163.com:00tengge@smtp.163.com');

Email.sendEmail = function (userInfo, callback) {
    console.log(userInfo);
    var mailSubject = '[MAD]感谢您的注册';
    var mailContent = '<h2>Hello，' + userInfo.name + '，感谢您注册成为MAD的一员!</h2>';
    mailContent += '<p>请点击链接完成注册:<a href="http://' + userInfo.checkUrl + '">验证邮箱</a></p>';
    mailContent += '<p>如果点击无效请复制一下链接到浏览器打开：http://' + userInfo.checkUrl + '</p>'
    
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"MAD 👥" <mad_advertisement@163.com>', // sender address
        to: userInfo.targetMail, // list of receivers
        subject: mailSubject, // Subject line
        text: 'Thank you for signup', // plaintext body
        html: mailContent // html body
    };
    
    
    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, info){
        if(error){
            callback(error);
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
        callback('Message sent: ' + info.response);
    }); 
}