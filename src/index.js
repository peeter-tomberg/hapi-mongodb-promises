var MongoClient = require('mongodb').MongoClient;
var MongoWrapper = require('./mongoWrapper');
var Joi = require('joi');

exports.register = function (plugin, options, next) {

    var schema = Joi.object({
        'url' : Joi.string().required(),
        'settings' : Joi.object()
    });
    var validation = Joi.validate(options, schema);
    if (validation.error) {
        return next(validation.error);
    }

    MongoClient.connect(options.url, options.settings || {}, function (error, db) {

        if (error) {
            next(error);
            return;
        }

        var mongoWrapper = new MongoWrapper(db);

        plugin.expose('find', mongoWrapper.find.bind(mongoWrapper));
        plugin.expose('findOne', mongoWrapper.findOne.bind(mongoWrapper));
        plugin.expose('findOneById', mongoWrapper.findOneById.bind(mongoWrapper));
        plugin.expose('insert', mongoWrapper.insert.bind(mongoWrapper));
        plugin.expose('insertOne', mongoWrapper.insertOne.bind(mongoWrapper));
        plugin.expose('update', mongoWrapper.update.bind(mongoWrapper));
        plugin.expose('db', db);

        next();
    });
};

exports.register.attributes = require('./../package.json');