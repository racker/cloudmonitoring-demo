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

var log = require('logmagic').local('cm.server');
var express = require('express');
var http = require('http');
var os = require('os');
var path = require('path');
var handlers = require('./handlers');
var middleware = require('./middleware');


function registerUrls(app) {

}

function main() {
  var port = 80;
  var app = express.createServer();
  var staticRoot, iconPath, viewsRoot;

  staticRoot = path.join(__dirname, '..', 'static');
  iconPath = path.join(staticRoot, 'favicon.ico');
  viewsRoot = path.join(__dirname, '..', 'views');


  if (os.type() == "Darwin") {
    port = 8080;
  }

  app.configure(function() {
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });

    app.use(express.logger());
    app.use(middleware.sslRedirect);
    app.use(express.bodyParser());

    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(app.router);
  });


  app.get('/favicon.ico', express.favicon(iconPath));
  app.use('/static/', express['static'](staticRoot));

  app.get('/', handlers.index);
  app.post('/login', handlers.attemptLogin);
  app.get('/login', handlers.login);

  log.info('Binding to http://0.0.0.0:' + port + '/');
  app.listen(port, '0.0.0.0');
}
exports.main = main;
