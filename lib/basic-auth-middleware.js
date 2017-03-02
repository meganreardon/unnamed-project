'use strict';

const createError = require('http-errors');
const debug = require('debug')('cfgram:basic-auth-middleware');

module.exports = function(req, res, next) {
  debug('auth');

  var authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(createError(401, 'authorization header is required'));
  }

  var base64str = authHeader.split('Basic ')[1];
  if (!base64str) {
    return next(createError(401, 'username and password are required'));
  }

  var utf8str = new Buffer(base64str, 'base64').toString();
  var authArray = utf8str.split(':');

  req.auth = {
    username: authArray[0],
    password: authArray[1]
  };

  if (!req.auth.username) {
    return next(createError(401, 'username required, no username provided'));
  }

  if (!req.auth.password) {
    return next(createError(401, 'password required, no password provided'));
  }

  next();
};
