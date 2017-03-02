'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const User = require('../model/user.js');

mongoose.Promise = Promise;

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com'
};

describe('Authorization Routes', function() {

  // ----------
  // POST tests
  // ----------

  describe('POST: /api/signup', function() {

    describe('WITH A VALID BODY', function() {
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });

    });

    describe('WITH AN INVALID BODY', function() {
      it('should return a 400 error', done => {
        request.post(`${url}/api/signup`)
        .send({username: '', password: ''})
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });

  });

  // ---------
  // GET tests
  // ---------

  describe('GET: /api/signin', function() {

    describe('WITH A VALID BODY', function() {
      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api/signin`)
        .auth('exampleuser', '1234')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
      });

      describe('WITH AN INVALID PASSWORD', function() {
        it('should return a 401 error', done => {
          request.get(`${url}/api/signin`)
          .auth('exampleuser', '5678')
          .end((err, res) => {
            expect(res.status).to.equal(401);
            done();
          });
        });
      });

    });
  });

  // --------------
  // BAD ROUTE test
  // --------------

  describe('WITH AN INVALID PATH', function() {
    it('should return a 404 error', done => {
      request.get(`${url}/api/notapath`)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });

});
