'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('cfgram:album-router');

const Album = require('../model/album.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const albumRouter = module.exports = Router();

albumRouter.post('/api/album', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/album');
  req.body.userID = req.user._id;
  new Album(req.body).save()
  .then( album => res.json(album))
  .catch(next);
});

albumRouter.get('/api/album/:id', bearerAuth, function(req, res, next) {
  debug('GET: /api/album/:id');

  Album.findById(req.params.id)
  .then( album => {
    if (album.userID.toString() !== req.user._id.toString()) {
      return next(createError(401, 'invalid user'));
    }
    res.json(album);
  })
  .catch( err => next(createError(404, err.message)));
});

albumRouter.put('/api/album/:id', bearerAuth, jsonParser, (req, res, next) => {
  debug('PUT: /api/album/:id');

  Album.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then( album => {
    if ((req.body.name == undefined) || (req.body.description == undefined)) {
      return next(createError(400, 'invalid body'));
    }
    res.json(album);
  })
  .catch( err => next(createError(404, err.message)));
});

albumRouter.delete('/api/album/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/album/:id');

  Album.findByIdAndRemove(req.params.id)
  .then( () => res.status(204).send())
  .catch( err => next(createError(404, err.message)));
});
