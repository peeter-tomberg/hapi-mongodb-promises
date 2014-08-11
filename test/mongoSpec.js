'use strict';
var path = require('path');
var Mongo = require(path.join('..', 'src', 'mongoWrapper'));

var expect = require('must');
var sinon = require('sinon');

var mongo;
var mock;

var findApi;
var findMock;

var createApi = function (fnName, type, callbackValue) {
    return {
        collection : function () {
            var returnValue = {};
            returnValue[fnName] = function (query, callback) {
                if (type === 'success') {
                    callback(null, callbackValue);
                }
                else if (type === 'error') {
                    callback(callbackValue || new Error('error'));
                }
                else if (type === 'noitemfound') {
                    callback(undefined, callbackValue);
                }
            };
            return returnValue;
        }
    };
};

describe('Mongo wrapper', function () {

    it('must throw an error when not initialized with a database parameter', function () {
        expect(function (){ new Mongo(); }).to.throw(Error, 'Cannot initialize mongo wrapper without a database');
    });

    beforeEach(function () {
        var dbApi = {
            collection : function () {}
        };
        findApi = {
            find : function () {},
            findOne : function () {},
            insert : function () {},
            update : function () {}
        };

        findMock = sinon.mock(findApi);

        mock = sinon.mock(dbApi);
        mongo = new Mongo(dbApi);

    });

    it('must proxy find requests to the mongo driver', function () {

        var spy = sinon.spy();
        findMock.expects('find').withArgs({ id : 1 }).returns({ toArray : spy });
        mock.expects('collection').withArgs('user').returns(findApi);

        mongo.find('user', { id : 1 });

        findMock.verify();
        mock.verify();

        expect(spy.callCount).to.be(1);

    });

    it('must proxy findOne requests to the mongo driver', function (done) {

        var mongoQuery = { id : 1 };
        var successItem = { id : 1, title : "title" };
        var errorError = new Error('error');

        var successCallback = sinon.spy();
        var errorCallback = sinon.spy();

        var dbSuccessApi = createApi('findOne', 'success', successItem);
        var dbErrorApi = createApi('findOne', 'error', errorError);

        mongo = new Mongo(dbSuccessApi);
        mongo.findOne('user', mongoQuery).then(successCallback).otherwise(errorCallback);

        mongo = new Mongo(dbErrorApi);
        mongo.findOne('user', mongoQuery).then(successCallback).otherwise(errorCallback);

        setTimeout(function () {
            expect(successCallback.calledOnce).to.be.true();
            expect(successCallback.calledWithExactly(successItem)).to.be.true();

            expect(errorCallback.calledOnce).to.be.true();
            expect(errorCallback.calledWithExactly(errorError)).to.be.true();

            done();
        }, 1);

    });

    it('must proxy findOneById requests to the mongo driver', function (done) {

        var mongoId = 1;
        var successItem = { id : 1, title : "title" };
        var errorError = new Error('error');

        var successCallback = sinon.spy();
        var errorCallback = sinon.spy();
        var errorCallbackNoItem = sinon.spy();

        var dbSuccessApi = createApi('findOne', 'success', successItem);
        var dbErrorApi = createApi('findOne', 'error', errorError);
        var dbNoItemFoundApi = createApi('findOne', 'noitemfound');

        mongo = new Mongo(dbSuccessApi);
        mongo.findOneById('user', mongoId).then(successCallback);

        mongo = new Mongo(dbErrorApi);
        mongo.findOneById('user', mongoId).otherwise(errorCallback);

        mongo = new Mongo(dbNoItemFoundApi);
        mongo.findOneById('user', mongoId).then(errorCallbackNoItem);

        setTimeout(function () {
            expect(successCallback.called).to.be.true();
            expect(successCallback.calledWithExactly(successItem)).to.be.true();

            expect(errorCallback.called).to.be.true();
            expect(errorCallback.calledWithExactly(errorError)).to.be.true();

            expect(errorCallbackNoItem.called).to.be.true();
            done();
        }, 1);


    });

    it('must proxy insert requests to the mongo driver', function () {

        findMock.expects('insert').withArgs({ name : 'Peeter' });
        mock.expects('collection').withArgs('user').returns(findApi);

        mongo.insert('user', { name : 'Peeter' });

        findMock.verify();
        mock.verify();

    });

    it('must proxy insertOne requests to the mongo driver', function (done) {

        var user = { 1 : 1, title : "title"};
        var successItem = [{ id : 1, title : "title" }];
        var errorError = new Error('error');

        var successCallback = sinon.spy();
        var errorCallback = sinon.spy();

        var dbSuccessApi = createApi('insert', 'success', successItem);
        var dbErrorApi = createApi('insert', 'error', errorError);

        mongo = new Mongo(dbSuccessApi);
        mongo.insertOne('user', user).then(successCallback);

        mongo = new Mongo(dbErrorApi);
        mongo.insertOne('user', user).otherwise(errorCallback);


        setTimeout(function () {
            expect(successCallback.called).to.be.true();
            expect(successCallback.calledWithExactly(successItem[0])).to.be.true();

            expect(errorCallback.called).to.be.true();
            expect(errorCallback.calledWithExactly(errorError)).to.be.true();

            done();
        }, 1);
    });

    it('must proxy update requests to the mongo driver', function () {

        findMock.expects('update').withArgs({ name : 'Peeter' }, { name : 'Pjotr' }, { upsert : true });
        mock.expects('collection').withArgs('user').returns(findApi);

        mongo.update('user', { name : 'Peeter' }, { name : 'Pjotr' }, { upsert : true });

        findMock.verify();
        mock.verify();

    });

    it('must proxy remove requests to the mongo driver', function (done) {

        var user = { 1 : 1, title : "title"};
        var successItem = [{ id : 1, title : "title" }];
        var errorError = new Error('error');

        var successCallback = sinon.spy();
        var errorCallback = sinon.spy();

        var dbSuccessApi = createApi('remove', 'success', successItem);
        var dbErrorApi = createApi('remove', 'error', errorError);

        mongo = new Mongo(dbSuccessApi);
        mongo.remove('user', user).then(successCallback).otherwise(errorCallback);

        mongo = new Mongo(dbErrorApi);
        mongo.remove('user', user).then(successCallback).otherwise(errorCallback);


        setTimeout(function () {
            expect(successCallback.calledOnce).to.be.true();
            expect(errorCallback.calledOnce).to.be.true();

            done();
        }, 1);
    });


});