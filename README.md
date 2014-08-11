[ ![Codeship Status for peeter-tomberg/hapi-mongodb-promises](https://codeship.io/projects/6d63ee10-02c1-0132-49a3-5eecd43daaed/status?branch=master)](https://codeship.io/projects/30317)
[![Coverage Status](https://coveralls.io/repos/peeter-tomberg/hapi-mongodb-promises/badge.png)](https://coveralls.io/r/peeter-tomberg/hapi-mongodb-promises)
[![Code Climate](https://codeclimate.com/github/peeter-tomberg/hapi-mongodb-promises/badges/gpa.svg)](https://codeclimate.com/github/peeter-tomberg/hapi-mongodb-promises)

# Hapi-MongoDB-promises

---------------------

This is a mongo db connection plugin and a promise wrapper for the mongo API. It enables your Hapi application to connect to mongodb and run queries. 

It takes 2 options :

- url: MongoDB connection string (eg. `mongodb://user:pass@localhost:27017`),

- settings: *Optional.* Provide extra settings to the connection, see [documentation](http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connect-options).

Several functions are exposed by this plugin :

- `find(collection, query)` : Returns a promise that resolves with the array of items matched.
- `findOne(collection, query)` : Returns a promise that resolves with the item matched.
- `findOneById(collection, id)` : Returns a promise that resolves with the item matched. 
    -   Autowraps the id in a ObjectId if not already done so.
- `insert(collection, document)` : Returns a promise that resolves with the array of items added.
- `insertOne(collection, document)` : Returns a promise that resolves with the first item added.
- `update(collection, query, update, options)` - Returns a promise that resolves with the result of the query

This plugin also exposes some objects :

- `db` : connection object to the database, if you need to run queries not available via the wrapper.

-----------------

Install:

```
    npm install hapi-mongodb-promises --save
```

Usage example :
```js
var Hapi = require("hapi");

var dbOpts = {
    "url": "mongodb://localhost:27017/test"
};

var server = new Hapi.Server(8080);

server.pack.register({
    plugin: require('hapi-mongodb-promises'),
    options: dbOpts
}, function (err) {
    if (err) {
        console.error(err);
        throw err;
    }
});

server.route( {
    "method"  : "GET",
    "path"    : "/users/{id}",
    "handler" : usersHandler
});

function usersHandler(request, reply) {
    var mongo = request.server.plugins['hapi-mongodb-promises'];
    mongo
        .findOneById('users', request.params.id)
        .then(reply)
        .otherwise(function (err) {
            reply(Hapi.error.internal('Internal MongoDB error', err));
        });
};

server.start(function() {
    console.log("Server started at " + server.info.uri);
});
```