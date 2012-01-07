/*
 *  Copyright 2012 Rackspace
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */


var express = require('express');
var http = require('http');
var os = require('os');
var app = express.createServer();
var port = 80;

if (os.type() == "Darwin") {
  port = 8080;
}

function sslRedirectMiddleware(req, res, next) {
  var host = req.headers['host'] ? req.headers['host'] : 'cloudmonitoring.nodejitsu.com'; 

  if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    res.writeHead(301, {'Content-Type': 'text/html', 'Location': 'https://' + host + req.url});
    res.write('<h1>Hey, use SSL Buddy!</h1>')
    res.end();
  }
  else {
    next();
  }
}


app.use(sslRedirectMiddleware);
app.get('/', function(req, res){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<h1>hello, i know nodejitsu.</h1>')
  res.end();
});

console.log('Binding to http://0.0.0.0:' + port + '/');
app.listen(port, '0.0.0.0');
