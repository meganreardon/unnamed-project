'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Album = require('../model/album.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com'
};

const exampleAlbum = {
  name: 'example album name',
  description: 'example album description'
};

mongoose.Promise = Promise;

describe('Album Routes', function() {
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Album.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  // ---------------------
  // POST tests /api/album
  // ---------------------

  describe('POST: /api/album', () => {
    beforeEach( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    it('should return an album', done => {
      request.post(`${url}/api/album`)
      .send(exampleAlbum)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.body.name).to.equal(exampleAlbum.name);
        expect(res.body.description).to.equal(exampleAlbum.description);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('should return a 401 error', done => {
      request.post(`${url}/api/album`)
      .send(exampleAlbum)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('should return a 400 error', done => {
      var invalidExampleAlbum = {
        name: '',
        description: ''
      };
      request.post(`${url}/api/album`)
      .send(invalidExampleAlbum)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });

  });

  // ------------------------
  // GET tests /api/album/:id
  // ------------------------

  describe('GET: /api/album/:id', () => {

    before( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    before( done => {
      exampleAlbum.userID = this.tempUser._id.toString();
      new Album(exampleAlbum).save()
      .then( album => {
        this.tempAlbum = album;
        done();
      })
      .catch(done);
    });

    it('should return an album', done => {
      request.get(`${url}/api/album/${this.tempAlbum._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.body.name).to.equal(exampleAlbum.name);
        expect(res.body.description).to.equal(exampleAlbum.description);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('should return a 401 error', done => {
      request.get(`${url}/api/album/${this.tempAlbum._id}`)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('should return a 404 error', done => {
      var incorrectAlbumId = '0123456789';
      request.get(`${url}/api/album/${incorrectAlbumId}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });

  });

  // ------------------------
  // PUT tests /api/album/:id
  // ------------------------

  describe('PUT: /api/album/:id', () => {

    beforeEach( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    beforeEach( done => {
      exampleAlbum.userID = this.tempUser._id.toString();
      new Album(exampleAlbum).save()
      .then( album => {
        this.tempAlbum = album;
        done();
      })
      .catch(done);
    });

    it('should update an album', done => {
      var updatedAlbum = { name: 'updated album name', description: 'updated album description' };
      request.put(`${url}/api/album/${this.tempAlbum._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .send(updatedAlbum)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.name).to.equal(updatedAlbum.name);
        expect(res.body._id).to.equal(this.tempAlbum._id.toString());
        done();
      });
    });

    it('should return a 401 error', done => {
      var updatedAlbum = { name: 'updated album name' };
      request.put(`${url}/api/album/${this.tempAlbum._id}`)
      .send(updatedAlbum)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('should return a 400 error', done => {
      var updatedInvalidAlbum = { name: '' };
      request.put(`${url}/api/album/${this.tempAlbum._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .send(updatedInvalidAlbum)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });

    it('should update an album', done => {
      var updatedAlbum = { name: 'updated album name' };
      var invalidAlbumId = '0123456789';
      request.put(`${url}/api/album/${invalidAlbumId}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .send(updatedAlbum)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });

  });

  // ---------------------------
  // DELETE tests /api/album/:id
  // ---------------------------

  describe('DELETE: /api/album/:id', () => {

    before( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    before( done => {
      exampleAlbum.userID = this.tempUser._id.toString();
      new Album(exampleAlbum).save()
      .then( album => {
        this.tempAlbum = album;
        done();
      })
      .catch(done);
    });

    it('should delete an album', done => {
      request.delete(`${url}/api/album/${this.tempAlbum._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(204);
        expect(res.body).to.be.empty;
        done();
      });
    });

  });

});
