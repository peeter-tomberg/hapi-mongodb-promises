var when = require('when');
var nodefn = require('when/node');

var ObjectId = require('mongodb').ObjectID;

/**
 * Creates a new wrapper
 * @param db - mongo database
 * @constructor
 */
function Mongo(db) {
    if (!db) {
        throw new Error('Cannot initialize mongo wrapper without a database');
    }
    this.mongo = db;
}
/**
 * Finds items from a collection based on a query
 * @returns {Promise.promise|*}
 * @param collection
 * @param query
 */
Mongo.prototype.find = function(collection, query) {
    var deferred = when.defer();
    this.mongo.collection(collection).find(query).toArray(nodefn.createCallback(deferred.resolver));
    return deferred.promise;
};
/**
 * Finds a single item from a collection based on a query
 * @returns {Promise.promise|*}
 * @param collection
 * @param query
 */
Mongo.prototype.findOne = function (collection, query) {
    var deferred = when.defer();
    this.mongo.collection(collection).findOne(query, nodefn.createCallback(deferred.resolver));
    return deferred.promise;
};
/**
 * Finds a single item from a collection based on an id
 * @returns {Promise.promise|*}
 * @param collection
 * @param id
 */
Mongo.prototype.findOneById = function (collection, id) {
    var deferred = when.defer();
    var mongoId = id instanceof ObjectId ? id : new ObjectId(id);
    this.mongo.collection(collection).findOne({ _id : mongoId }, nodefn.createCallback(deferred.resolver));
    return deferred.promise;
};
/**
 * Insert documents into a collection
 * @returns {Promise.promise|*}
 * @param collection
 * @param document
 */
Mongo.prototype.insert = function (collection, document) {
    var deferred = when.defer();
    this.mongo.collection(collection).insert(document, nodefn.createCallback(deferred.resolver));
    return deferred.promise;
};
/**
 * Insert a single document into a collection
 * @param collection
 * @param document
 * @returns {Promise.promise|*}
 */
Mongo.prototype.insertOne = function (collection, document) {
    var deferred = when.defer();
    this.mongo.collection(collection).insert(document, function (err, results) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(results[0]);
        }
    });
    return deferred.promise;
};
/**
 * Update a collections document based on a query
 * @returns {Promise.promise|*}
 * @param collection
 * @param query
 * @param update
 * @param options
 */
Mongo.prototype.update = function (collection, query, update, options) {
    var deferred = when.defer();
    this.mongo.collection(collection).update(query, update, options, nodefn.createCallback(deferred.resolver));
    return deferred.promise;
};

module.exports = Mongo;