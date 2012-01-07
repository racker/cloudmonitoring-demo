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
var path = require('path');
var handlers = require('./handlers');
var middleware = require('./middleware');


function registerUrls(app) {
  var staticRoot, iconPath, viewsRoot;

  staticRoot = path.join(__dirname, 'static');
  iconPath = path.join(staticRoot, 'favicon.ico');
  viewsRoot = path.join(__dirname, 'views');

  app.set('view engine', 'jade');
  app.set('view options', { layout: false });

  app.use(middleware.sslRedirect);

  app.get('/favicon.ico', express.favicon(iconPath));
  app.use('/static/', express['static'](staticRoot));

  app.get('/', handlers.index);
  app.get('/login', handlers.login);
}

function main() {
  var port = 80;
  var app = express.createServer();

  if (os.type() == "Darwin") {
    port = 8080;
  }

  registerUrls(app);
  console.log('Binding to http://0.0.0.0:' + port + '/');
  app.listen(port, '0.0.0.0');
}
exports.main = main;
