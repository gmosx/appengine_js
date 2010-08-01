/**
 * @fileoverview A port of the Python google.appengine.ext.db API to Javascript.
 *
 * http://code.google.com/appengine/docs/python/datastore/queryclass.html#Query
 */

var DATASTORE = require("google/appengine/api/datastore"),
    DatastoreRPC = DATASTORE.DatastoreRPC;

var JDatastore = DATASTORE.Datastore,
	JEntityNotFoundException = Packages.com.google.appengine.api.datastore.EntityNotFoundException,
	JKey = Packages.com.google.appengine.api.datastore.Key,
    JArrayList = java.util.ArrayList;

var argsArray = Array.prototype.splice,
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

mod = require("google/appengine/api/datastore/types");
for (var i in mod) exports[i] = mod[i];

var Query = exports.Query,
    Key = exports.Key,
    entityToObject = exports.entityToObject,
    objectToEntity = exports.objectToEntity;

exports.STRONG_CONSISTENCY = DATASTORE.STRONG_CONSISTENCY;
exports.EVENTUAL_CONSISTENCY = DATASTORE.EVENTUAL_CONSISTENCY;

/**
 * Create an rpc for use in configuring datastore calls.
 * 
 * Args:
 *   deadline: float, deadline for calls in seconds.
 *   callback: callable, a callback triggered when this rpc completes,
 *     accepts one argument: the returned rpc.
 *   read_policy: flag, set to EVENTUAL_CONSISTENCY to enable eventually
 *     consistent reads
 *
 *  Returns:
 *   A datastore.DatastoreRPC instance.
 */
exports.createRPC = function (args) {
    return new DatastoreRPC(args); 
}
    
/**
 * Gets the entity or entities for the given key or keys, of any Model.
 */
exports.get = function (keys) {
    if (isArray(keys)) {
        if (typeof(keys[0]) == "string") {        
            keys = keys.map(function (k) { new Key(k) });
        }
    } else {
        if (typeof(keys) == "string") {        
            keys = new Key(keys);
        }
    }

    if (isArray(keys)) {
        var list = new JArrayList(keys.length);
        for (var i = 0; i < keys.length; i++) list.add(keys[i].__key__);
        var entities = JDatastore.get(list).values();

        var objects = [];
        for (var e in Iterator(entities)) {
            objects.push(entityToObject(e));
        }

        return objects;        
    } else {
    	var entity;
    	try {
    		entity = JDatastore.get(keys.__key__);
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
// FIXME: wrap returned Key!
exports.put = function (objects) {
    if (isArray(objects)) {
        if (objects.length > 0) {
            var list = new JArrayList(objects.length);
            for (var i = 0; i < objects.length; i++) list.add(objects[i]._populateEntity());
            return JDatastore.put(list);
        } else {
            return [];
        }
    } else {
    	return JDatastore.put(objects._populateEntity());
    }
}

/**
 * Deletes one or more model instances from the datastore.
 *
 * WARNING: 'delete' is a reserved word in JavaScript so model.remove() or
 * model.DELETE() are used instead!
 */
// TODO: use model, string or Key. 
exports.remove = exports.DELETE = function (keys) {
    if (isArray(keys)) {
        if (keys.length > 0) {
            var list = new JArrayList(keys.length);
            // FIXME: implement with UTILS.datastoreKey();
//            for (var i = 0; i < keys.length; i++) list.add(keys[i].__key__);
            for (var i = 0; i < keys.length; i++) list.add(keys[i].datastoreKey());
            JDatastore["delete"](list);
        }
    } else {
        JDatastore["delete"](keys.__key__);
    }
}

/**
 * Runs a function containing datastore updates in a single transaction. If any 
 * code raises an exception during the transaction, all datastore updates made 
 * in the transaction are rolled back.
 *
 * http://code.google.com/appengine/docs/python/datastore/transactions.html
 */
exports.runInTransaction = function () {
    var result;
    var args = argsArray.call(arguments, 0)
    var func = args.shift();

    var tx = JDatastore.beginTransaction ();
    try {
        result = func.apply(null, args);
    } catch (e) {
        tx.rollback();
        throw e;
    }
    tx.commit();
    
    if (undefined != result) return result;
}

/**
 * Create a datastore key.
 */
exports.key = exports.Key.create;

