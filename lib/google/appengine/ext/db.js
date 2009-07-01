/**
 * A port of the Python google.appengine.ext.db API to Javascript.
 *
 * http://code.google.com/appengine/docs/python/datastore/queryclass.html#Query
 */

var datastore = require("google/appengine/api/datastore"),
    Datastore = datastore.Datastore,
    DatastoreQuery = datastore.Query,
    Key = datastore.Key,
    Entity = datastore.Entity,
    DESCENDING = DatastoreQuery.SortDirection.DESCENDING;

var newJavaArray = java.lang.reflect.Array.newInstance,
    argsArray = Array.prototype.splice,
    isArray = Array.isArray;

// A map from kind strings to kind constructors.
var kindMap = {};

/**
 * Gets the entity or entities for the given key or keys, of any Model.
 */
/*
exports.get = function(keys, constructor) {
    if (isArray(keys)) {
        var len = keys.length;
        var arr = newJavaArray(Key, len);
        for (var i = 0; i < len; i++) arr[i] = keys[i];
        var entities = Datastore.get(arr);
        var objects = [];
        for (var e in Iterator(entities))
            objects.push(entityToObject(e, constructor));
        return objects;        
    } else {
        var entity = Datastore.get(keys);
        return entityToObject(entity, constructor);
    }
}
*/

exports.get = function(keys) {
    if (isArray(keys)) {
        var len = keys.length;
        var arr = newJavaArray(Key, len);
        for (var i = 0; i < len; i++) arr[i] = keys[i];
        var entities = Datastore.get(arr);
        var objects = [];
        for (var e in Iterator(entities))
            objects.push(entityToObject(e, kindMap[e.getKind()]));
        return objects;        
    } else {
        var e = Datastore.get(keys);
        return entityToObject(e, kindMap[e.getKind()]);
    }
}

/**
 * Puts one or more model instances into the datastore.
 */
exports.put = function(objects) {
    if (isArray(objects)) {
        var len = objects.length;
        var arr = newJavaArray(Entity, len);
        for (var i = 0; i < len; i++) arr[i] = objectToEntity(objects[i]);
        return Datastore.put(arr);
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
        var len = keys.length;
        var arr = newJavaArray(Key, len);
        for (var i = 0; i < len; i++) arr[i] = keys[i];
        Datastore["delete"](arr);    
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
        result = func(args);
    } catch (e) {
        tx.rollback();
        throw e;
    }
    tx.commit();
    
    if (undefined != result) return result;
}

var stringToKey = exports.stringToKey = exports.key = datastore.KeyFactory.stringToKey;

var keyToString = exports.keyToString = datastore.KeyFactory.keyToString;

// Convert a GAE DataStore entity to an object.
// Uses the metadata in the constructor.Model to convert the object properties.
var entityToObject = function(entity, constructor) {
	var obj = new constructor();

    var properties = constructor.Model.properties;
	
	for (var prop in Iterator(entity.getProperties().entrySet())) {
	    var pname = prop.getKey();
	    obj[pname] = properties[pname](prop.getValue());
	}
	
	obj.__key__ = entity.getKey();
	
	return obj;
}

// Convert an object to a GAE DataStore entity.
// Uses the metadata in the constructor.Model to convert the object properties.
var objectToEntity = function(obj) {
    var properties = obj.constructor.Model.properties;
	
	var entity = obj.createEntity();

    for (var prop in properties) {
		entity.setProperty(prop, obj[prop]);
    }

	return entity;
}

/**
 * The Query class is a datastore query interface that uses objects and methods 
 * to prepare queries.
 */
var Query = exports.Query = function(constructor, keysOnly) {
    this.model = constructor.Model;
    this.entityConstructor = constructor;
    this.query = new DatastoreQuery(this.model.table);
    this.keysOnly = keysOnly;
    if (keysOnly) this.query.setKeysOnly();
}

var FILTER_OPERATORS = {
	"=": DatastoreQuery.FilterOperator.EQUAL
}

/**
 * Adds a property condition filter to the query. Only entities with properties 
 * that meet all of the conditions will be returned by the query.
 */
Query.prototype.filter = function(property_op, value) {
	var parts = property_op.split(" ");
	this.query.addFilter(parts[0], FILTER_OPERATORS[parts[1]], value);
    return this;
}

/**
 * Adds an ordering for the results. Results are ordered starting with the first 
 * order added.
 * @arguments:
 * property
 *   A string, the name of the property to order. To specify that the order 
 *   ought to be in descending order, precede the name with a hyphen (-). Without 
 *   a hyphen, the order is ascending. 
 */
Query.prototype.order = function(property) {
    if (property.begins("-"))
        this.query.setSort(property.slice(1), DESCENDING);
    else
        this.query.setSort(property);
    return this;
}

Query.prototype.ancestor = function(ancestorKey) {
    this.query.setAncestor(ancestorKey);
    return this;
}

Query.prototype.get = function(key, constructor) {

}

Query.prototype.fetch = function(limit) {
    if (!this.prepared) this.prepared = Datastore.prepare(this.query);

    var objects = [];

    if (this.keysOnly)
	    for (var e in Iterator(this.prepared.asIterator()))
	    	objects.push(e);
    else
	    for (var e in Iterator(this.prepared.asIterator()))
	    	objects.push(entityToObject(e, this.entityConstructor));

    return objects;    
}

Query.prototype.forEach = function() {
}

Query.prototype.count = function(limit) {
}

exports.model = function(constructor, meta) {
	constructor.Model = meta;
	kindMap[meta.table] = constructor;
}