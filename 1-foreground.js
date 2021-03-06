var http          = require('http');
var nodemailer    = require('nodemailer');
var httpPort      = process.env.PORT || 8080;
var httpHost      = process.env.HOST || '127.0.0.1';

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: require('./.emailUsername'),
      pass: require('./.emailPassword')
    }
});

var sendEmail = function(req, callback){
  var urlParts     = req.url.split('/');    
  var email        = {
    from:    require('./.emailUsername'),
    to:      decodeURI(urlParts[1]),
    subject: decodeURI(urlParts[2]),
    text:    decodeURI(urlParts[3]),
  };
  transporter.sendMail(email, function(error, info){
    callback(error, email);
  });
};

var server = function(req, res){
  var start = Date.now();
  var responseCode = 200;
  var response     = {};
  sendEmail(req, function(error, email){
    response.email = email;
    if(error){
      console.log(error);
      responseCode = 500;
      response.error = error;
    }
    res.writeHead(responseCode, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(response, null, 2));
    var delta = Date.now() - start;
    console.log('Sent an email to ' + email.to + ' in ' + delta + 'ms');
  });
};

http.createServer(server).listen(httpPort, httpHost);

console.log('Server running at ' + httpHost + ':' + httpPort);
console.log('send an email and message to /TO_ADDRESS/SUBJECT/YOUR_MESSAGE');
