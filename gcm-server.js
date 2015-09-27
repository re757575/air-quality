// var SERVER_KEY = 'YOUR_SERVER_KEY'; // 常常401, 故改用 BROWSER_KEY
var BROWSER_KEY = 'YOUR_BROWSER_KEY';
var reg_id_1 = 'APA91bFV....';
// var reg_id_2 = 'APA91bFm2-....';

// var gcm = require('node-gcm');
// var message = new gcm.Message();

// var sender = new gcm.Sender(BROWSER_KEY);
// var registrationIds = [];

// // Value the payload data to send...
// message.addData('message', 'Hello Cordova!');
// message.addData('title','Push Notification Sample' );
// message.addData('msgcnt','2'); // Shows up in the notification in the status bar
// message.addData('soundname','beep.wav'); //Sound to play upon notification receipt - put in the www folder in app
// message.collapseKey = 'demo';
// message.delayWhileIdle = true; //Default is false
// message.timeToLive = 3000;// Duration in seconds to hold in GCM and retry before timing out. Default 4 weeks (2,419,200 seconds) if not specified.


// // At least one reg id required
// registrationIds.push(reg_id_1);
// registrationIds.push(reg_id_2);

// /**
//  * Parameters: message-literal, registrationIds-array, No. of retries, callback-function
//  */
// sender.send(message, registrationIds, 4, function (err, result) {
// 	if (err !== null) {
// 		console.log('gcm error: '+ err);
// 	} else {
// 		console.log('gcm result:'+ result);
// 	}
// });

// 原生的方式
var http = require('http');

var data = {
  "collapseKey":"applice",
  "delayWhileIdle":true,
  "timeToLive":3,
  "data":{
    "message":"My message","title":"My Title",
    "soundname": "beep.wav"
    },
  "registration_ids":[reg_id_1]
};

var dataString = JSON.stringify(data);
var headers = {
  'Authorization' : 'key='+ BROWSER_KEY,
  'Content-Type' : 'application/json',
  'Content-Length' : dataString.length
};

var options = {
  host: 'android.googleapis.com',
  port: 80,
  path: '/gcm/send',
  method: 'POST',
  headers: headers
};

//Setup the request 
var req = http.request(options, function(res) {
  res.setEncoding('utf-8');

  var responseString = '';

  res.on('data', function(data) {
    responseString += data;
  });

  res.on('end', function() {
    var resultObject = JSON.parse(responseString);
    console.log(resultObject);
  });
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));

});

req.on('error', function(e) {
  // TODO: handle error.
  console.log('error : ' + e.message + e.code);
});

req.write(dataString);
req.end();