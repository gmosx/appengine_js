/**
 * A port of the Python google.appengine.ext.db API to Javascript.
 *
 * http://code.google.com/appengine/docs/python/datastore/queryclass.html#Query
 */

var datastore = require("google/appengine/api/datastore"),
    Datastore = datastore.Datastore,
    Key = exports.Key = datastore.Key,
    KeyFactory = exports.KeyFactory = datastore.KeyFactory,
    Entity = exports.Entity = datastore.Entity;
    
var JArrayList = java.util.ArrayList,
	JEntityNotFoundException = Packages.com.google.appengine.api.datastore.EntityNotFoundException,
	JKey = Packages.com.google.appengine.api.datastore.Key,
    argsArray = Array.prototype.splice,
    isArray = Array.isArray;

mod = require("google/appengine/ext/db/utils");
for (var i in mod) exports[i] = mod[i];

var mod = require("google/appengine/ext/db/query");
for (var i in mod) exports[i] = mod[i];

mod = require("google/appengine/ext/db/properties");
for (var i in mod) exports[i] = mod[i];

mod = require("google/appengine/ext/db/errors");
for (var i in mod) exports[i] = mod[i];

mod = require("google/appengine/ext/db/model");
for (var i in mod) exports[i] = mod[i];

var Query = exports.Query,
    resolveKey = exports.resolveKey,
    entityToObject = exports.entityToObject,
    objectToEntity = exports.objectToEntity;
    
/**
 * Gets the entity or entities for the given key or keys, of any Model.
 */
exports.get = function(keys) {
    if (isArray(keys)) {
        var list = new JArrayList(keys.length);
        for (var i = 0; i < keys.length; i++) list.add(keys[i]);
        var entities = Datastore.get(list).values();

        var objects = [];
        for (var e in Iterator(entities)) {
            objects.push(entityToObject(e));
        }

        return objects;        
    } else {
    	var entity;
    	try {
    		entity = Datastore.get(keys);
    	} catch (e) {
    		if (e.javaException instanceof JEntityNotFoundException)
    			return null;
    		else 
    			throw e;
    	}
        return entityToObject(entity);
    }
}

/**
 * Puts one or more model instances into the datastore.
 */
exports.put = function(objects) {
    if (isArray(objects)) {
        var list = new JArrayList(objects.length);
        for (var i = 0; i < objects.length; i++) list.add(objectToEntity(objects[i]));
        return Datastore.put(list);
    } else {
    	return Datastore.put(objectToEntity(objects));
    }
}

/**
 * Deletes one or more model instances from the datastore.
 */
// TODO: use model, string or Key. 
exports.remove = exports.DELETE = function(keys) {
    if (isArray(keys)) {
        var list = new JArrayList(keys.length);
        for (var i = 0; i < keys.length; i++) list.add(keys[i]);
        Datastore["delete"](list);
    } else {
        Datastore["delete"](keys);
    }
}

/**
 * Runs a function containing datastore updates in a single transaction. If any 
 * code raises an exception during the transaction, all datastore updates made 
 * in the transaction are rolled back.
 *
 * http://code.google.com/appengine/docs/python/datastore/transactions.html
 */
exports.runInTransaction = function() {
    var result;
    var args = argsArray.call(arguments, 0)
    var func = args.shift();

    var tx = Datastore.beginTransaction();
    try {
        result = func.apply(null, args);
    } catch (e) {
        tx.rollback();
        throw e;
    }
    tx.commit();
    
    if (undefined != result) return result;
}

exports.key = KeyFactory.createKey;

var stringToKey = exports.stringToKey = KeyFactory.stringToKey;

// var keyToString = exports.keyToString = KeyFactory.keyToString;

var keyToString = exports.keyToString = function(key) {
    return String(KeyFactory.keyToString(key));
}

