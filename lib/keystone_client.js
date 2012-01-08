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

var request = require('request');
var sprintf = require('sprintf').sprintf;
var async = require('async');
var querystring = require('querystring');

/* We trust the token is valid for at least 60 seconds */
var TRUST_TOKEN_FOR = 60;

/* TODO: make configurable */
var KEYSTONE_URL = 'https://auth.api.rackspacecloud.com/v2.0';

/**
 * Create an OpenStack Keystone Identity API client.
 *
 * @param {Object} ctx Operation context.
 * @param {String} keystoneUrl Base keystone server url.
 * @param {Object} options Authentication options (username, apikey, password).
 * @constructor
 */
function KeystoneClient(options) {
  this._url = KEYSTONE_URL;
  this._username = options.username;
  this._apikey = options.apikey;
  this._password = options.password;
  this._extraArgs = options.extraArgs || {};
  this._token = null;
  this._tokenExpires = null;
  this._refreshTokenCompletions = [];
  this._tokenUpdated = 0;
  this._tenantId = null;
  this._serviceCatalog = [];
}


/**
 * @return {Object} default http request options.
 */
KeystoneClient.prototype._defaultOptions = function() {
  var options = {
    'headers': {'Accept': 'application/json'},
  };
  return options;
};


/**
 * Ensure we have a relatively fresh auth api token.
 *
 * @param {Function} callback Completion callback.
 */
KeystoneClient.prototype._freshToken = function(callback) {
  var curtime;

  curtime = new Date().getTime() / 1000;

  if (curtime < this._tokenUpdated + TRUST_TOKEN_FOR) {
    callback(null, this._token);
    return;
  }

  this._refreshTokenCompletions.push(callback);

  if (this._refreshTokenCompletions.length === 1) {
    this._updateToken();
  }
};


/**
 * Update our Service catalog and Auth Token caches.
 * Notifies this._refreshTokenCompletions on completion or error.
 */
KeystoneClient.prototype._updateToken = function() {
  var options, url, body, self = this;

  options = this._defaultOptions();
  options.headers['Content-Type'] = 'application/json';

  url = sprintf('%s/tokens', this._url);
  body = {};

  if (this._password) {
    body = {'auth': {'passwordCredentials': {'username': this._username, 'password': this._password}}};
  }
  else {
    body = {'auth': {'RAX-KSKEY:apiKeyCredentials': {'username': this._username, 'apiKey': this._apikey}}};
  }

  function complete(err, result) {
    var cpl;

    self._tokenUpdated = new Date().getTime() / 1000;
    cpl = self._refreshTokenCompletions;
    self._refreshTokenCompletions = [];
    cpl.forEach(function(func) {
      func(err, result);
    });
  }

  options.uri = url;
  options.method = 'POST';
  options.json = body;
  options.strictSSL = true;

  request(options, function(err, response, body) {
    var cpl;

    if (err) {
      complete(err);
      return;
    }

    if (body.access) {
      self._token = body.access.token.id;
      self._tokenExpires = body.access.token.expires;
      self._serviceCatalog = body.access.serviceCatalog;
    }
    else {
      complete(new Error('malformed response: ' + JSON.stringify(body)));
      return;
    }

    complete(null, self._token);
  });
};


/**
 * Get the service catalog from Keystone.
 *
 * @param {Function} callback Completion callback.
 */
KeystoneClient.prototype.serviceCatalog = function(callback) {
  var self = this;

  this._freshToken(function(err) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, self._serviceCatalog);
  });
};


/**
 * Get the tenant id and token from Keystone.
 *
 * @param {Function} callback Completion callback.
 */
KeystoneClient.prototype.tenantIdAndToken = function(callback) {
  var self = this,
      tenantId;

  this._freshToken(function(err) {
    if (err) {
      callback(err);
      return;
    }

    self._serviceCatalog.forEach(function(item) {
      if (item.name === 'cloudServers') {
        if (item.endpoints.length === 0) {
          throw new Error('Endpoints should always be > 0');
        }
        tenantId = item.endpoints[0].tenantId;
      }
    });

    callback(null, { token: self._token, expires: self._tokenExpires, tenantId: tenantId });
  });
};


/** Keystone Client Class */
exports.KeystoneClient = KeystoneClient;
