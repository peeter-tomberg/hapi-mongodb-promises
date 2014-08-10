'use strict';
var expect = require('must');
var sinon = require('sinon');

var Hapi = require('hapi');

var plugin = require('../index');

describe('Mongo plugin', function() {
    var server = null;
    var sandbox;
    var mongodb;

    beforeEach(function() {
        server = new Hapi.Server();
        sandbox = sinon.sandbox.create();
        mongodb = {};

        sandbox.stub(require('mongodb').MongoClient, 'connect', function (url, options, callback) {
            callback(null, mongodb);
        });

    });

    afterEach(function () {
        server = null;
        sandbox.restore();
    });

    it('should throw an error when registered without an url', function(done) {
        server.pack.register({
            plugin: plugin
        }, function (err) {
            expect(err).to.be.a(Error);
            done();
        });
    });

    it('should throw an error when mongo connection fails', function(done) {

        sandbox.restore();
        sandbox.stub(require('mongodb').MongoClient, 'connect', function (url, options, callback) {
            callback(new Error('error'));
        });

        server.pack.register({
            plugin: plugin,
            options : {
                url : 'fakemongourl'
            }
        }, function (err) {
            expect(err).to.be.a(Error);
            done();
        });
    });

    it('should register with just an url', function(done) {
        server.pack.register({
            plugin: plugin,
            options : {
                url : 'mongofakeurl'
            }
        }, function (err) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it ('should expose functions and the db object', function (done) {

        server.pack.register({
            plugin: plugin,
            options : {
                url : 'mongofakeurl'
            }
        }, function () {

            var functionNames = ['find', 'findOne', 'findOneById', 'insert', 'insertOne', 'update'];
            functionNames.forEach(function (name) {
                expect(server.plugins['hapi-mongodb-promises'][name]).to.be.a(Function);
            });

            expect(server.plugins['hapi-mongodb-promises'].db).to.exist();

            done();
        });

    });

});