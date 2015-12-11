'use strict';

/**
 * Module dependencies
 */

var url = require('url');
var request = require('request');
var extend = require('deep-extend');

// Package version
var VERSION = require('../package.json').version;

function Teratail (options) {
  if (!(this instanceof Teratail)) return new Teratail(options);

  this.VERSION = VERSION;

  // Merge the default options with the client submitted options
  this.options = extend({
    bearer_token: null,
    rest_base: 'https://teratail.com/api/v1',
    request_options: {
      headers: {
        'Accept': '*/*',
        'Connection': 'close',
        'User-Agent': 'node-teratail/' + VERSION,
      }
    }
  }, options);
  //Check to see if we are going to use User Authentication or Application Authetication
  if (this.options.bearer_token){
    //Ok we have a bearer token, so going with application-only auth
    // Build a request object
    this.request = request.defaults(
      extend(
        this.options.request_options,
        {
          headers: {
            Authorization: 'Bearer ' + this.options.bearer_token
          }
        }
      )
    );
  }
  else {
    this.request = request.defaults(this.options.request_options);
  }
}

Teratail.prototype.__buildEndpoint = function(path, base) {

  var endpoint = this.options.rest_base;

  if (url.parse(path).protocol !== null) {
    endpoint = path;
  }
  else {
    endpoint += (path.charAt(0) === '/') ? path : '/' + path;
  }

  // Remove trailing slash
  endpoint = endpoint.replace(/\/$/, "");

  return endpoint;
};

Teratail.prototype.__request = function(method, path, params, callback) {
  var base = 'rest';

  // Set the callback if no params are passed
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }

  // Set API base
  if (typeof params.base !== 'undefined') {
    base = params.base;
    delete params.base;
  }

  // Build the options to pass to our custom request object
  var options = {
    method: method.toLowerCase(),  // Request method - get
    url: this.__buildEndpoint(path, base), // Generate url
    qs: params  // Pass url parameters if get
  };

  this.request(options, function(error, response, data){
    if (error) {
      callback(error, data, response);
    }
    else {
      try {
        data = JSON.parse(data);
      }
      catch(parseError) {
        callback(
          new Error('Status Code: ' + response.statusCode),
          data,
          response
        );

      }
      if (typeof data.errors !== 'undefined') {
        callback(data.errors, data, response);
      }
      else if(response.statusCode !== 200) {
        callback(
          new Error('Status Code: ' + response.statusCode),
          data,
          response
        );
      }
      else {
        callback(null, data, response);
      }
    }
  });
};

/**
 * GET
 */
Teratail.prototype.get = function(url, params, callback) {
  return this.__request('get', url, params, callback);
};

module.exports = Teratail;