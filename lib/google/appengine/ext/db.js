/**
 * A port of the Python google.appengine.ext.db API to Javascript.
 *
 * http://code.google.com/appengine/docs/python/datastore/queryclass.html#Query
 */

var datastore = require("google/appengine/api/datastore"),
    Datastore = datastore.Datastore,
    DatastoreQuery = datastore.Query,
    Key = exports.Key = datastore.Key,
    KeyFactory = exports.KeyFactory = datastore.KeyFactory,
    Entity = exports.Entity = datastore.Entity,
    DESCENDING = DatastoreQuery.SortDirection.DESCENDING;

var JArrayList = java.util.ArrayList,
    argsArray = Array.prototype.splice,
    isArray = Array.isArray;

// A map from kind strings to kind constructors.
var kindMap = {};

/**
 * Gets the entity or entities for the given key or keys, of any Model.
 */
exports.get = function(keys) {
    if (isArray(keys)) {
        var list = new JArrayList(keys.length);
        for (var i = 0; i < keys.length; i++) list.add(keys[i]);
        var entities = Datastore.get(list);

        var objects = [];
        for (var e in Iterator(entities))
            objects.push(entityToObject(e));

        return objects;        
    } else {
        var e = Datastore.get(keys);
        return entityToObject(e);
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

var keyToString = exports.keyToString = KeyFactory.keyToString;

// Convert a GAE DataStore entity to an object.
// Uses the metadata in the constructor.Model to convert the object properties.
var entityToObject = function(entity) {
	var constructor = kindMap[entity.getKind()];
    var properties = constructor.Model.properties;

    // Allocate a new object instance without calling the constructor.
	var obj = Object.create(constructor.prototype);
    
	for (var prop in Iterator(entity.getProperties().entrySet())) {
	    var pname = prop.getKey();
	    var property = properties[pname];
	    if (property) // THINK: extra safety for changing schemas?
	    	obj[pname] = property.makeValueFromDatastore(prop.getValue());
	}
	
	obj.__key__ = entity.getKey();
	
	return obj;
}

// Convert an object to a GAE DataStore entity.
// Uses the metadata in the constructor.Model to convert the object properties.
var objectToEntity = function(obj) {
	var model = obj.constructor.Model;
    var properties = model.properties;
	var entity = obj.constructor.createEntity(obj);

    for (var pname in properties) {
    	var property = properties[pname];
    	var value = obj[pname];
    	if (undefined != value)
    		entity.setProperty(pname, property.getValueForDatastore(value));
    }

	return entity;
}

/**
 * The Query class is a datastore query interface that uses objects and methods 
 * to prepare queries.
 */
var Query = exports.Query = function(constructor, keysOnly) {
    this.model = constructor.Model;
    this.query = new DatastoreQuery(this.model.kind);
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
	var property = this.model.properties[parts[0]];
	this.query.addFilter(parts[0], FILTER_OPERATORS[parts[1]], property.getValueForDatastore(value));
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
        this.query.addSort(property.slice(1), DESCENDING);
    else
        this.query.addSort(property);
    return this;
}

Query.prototype.ancestor = function(ancestorKey) {
    this.query.setAncestor(ancestorKey);
    return this;
}

Query.prototype.keysOnly = function() {
    this.query.setKeysOnly();
    return this;
}

Query.prototype.limit = function(limit) {
	this.limit = limit;
}

Query.prototype.offset = function(offset) {
	this.offset = offset;
}

Query.prototype.get = function(key, constructor) {
    if (!this.prepared) this.prepared = Datastore.prepare(this.query);

    if (this.query.isKeysOnly())
	    for (var e in Iterator(this.prepared.asIterator()))
	    	return e.getKey();
    else
	    for (var e in Iterator(this.prepared.asIterator()))
	    	return entityToObject(e);
}

Query.prototype.fetch = function(limit, offset) {
    if (!this.prepared) this.prepared = Datastore.prepare(this.query);

    var objects = [];

    if (this.query.isKeysOnly())
	    for (var e in Iterator(this.prepared.asIterator()))
	    	objects.push(e.getKey());
    else
	    for (var e in Iterator(this.prepared.asIterator()))
	    	objects.push(entityToObject(e));

    return objects;    
}

Query.prototype.keys = function(limit, offset) {
	this.query.setKeysOnly();
	return this.fetch();
}

Query.prototype.forEach = function() {
}

Query.prototype.count = function(limit) {
}

//-----------------------------------------------------------------------------

var KindError = exports.KindError = function(message) {
	this.message = message;
}

KindError.prototype.toString = function() {
	return this.message;
}

// -----------------------------------------------------------------------------

/** 
 * The Model is the 'superclass' for data model definitions.
 */
var Model = exports.Model = function() {
}

Model.kind = function() {
	return this.Model.kind;
}

Model.properties = function() {
	return this.Model.properties;
}

Model.get = function(keys) {
	var objs = db.get(key);

	var kind = this.kind();
	var arr = isArray(objs) ? objs : [objs];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].constructor.kind() != kind) 
			throw new KindError("Instance is of kind '" + arr[i].constructor.kind() + "', expected kind is '" + kind + "'");
	}
	
	return objs;
}

Model.getById = function(ids) {
}

Model.getByKeyName = function(names) {
}

Model.all = function() {
	return Query(this);
}

Model.gql = function(gql) {
	throw new Error("Not implemented");
}

Model.entityToObject = entityToObject;

Model.objectToEntity = objectToEntity;

Model.createEntity = function(obj) { 
	return new Entity(kind, obj.__key__.getName(), obj.__key__.getParent()); 
}

Model.prototype.setKey = function(key) {
	this.__key__ = key;
}

Model.prototype.key = Model.prototype.getKey = function() {
	return this.__key__;
}

Model.prototype.parent = function() {
	var pkey = this.__key__.getParent();
	return (pkey ? db.get(pkey) : null);
}

Model.prototype.parentKey = function() {
	return this.__key__.getParent();
}

exports.model = function(constructor, kind, properties, model) {
	if (!model) model = {};
	model.kind = kind;
	model.properties = properties;
	
	constructor.Model = model;

	for (var propName in properties)
		properties[propName].init(constructor, propName);

	kindMap[kind] = constructor;

	constructor.__proto__ = Model;
	constructor.prototype.__proto__ = Model.prototype;

	return model;
}

// -----------------------------------------------------------------------------
// Properties

/**
 * 
 */
var StringProperty = exports.StringProperty = function(options) {
	if (options) {
		this.multiline = options.multiline;
	}
}

StringProperty.prototype.init = function(constructor, propName) {
}

StringProperty.prototype.getValueForDatastore = function(value) {
    return value;
}

StringProperty.prototype.makeValueFromDatastore = function(value) {
    return String(value);
}

/**
 * 
 */
var IntegerProperty = exports.IntegerProperty = function() {
}

IntegerProperty.prototype.init = function(constructor, propName) {
}

IntegerProperty.prototype.getValueForDatastore = function(value) {
   return value;
}

IntegerProperty.prototype.makeValueFromDatastore = function(value) {
	return Number(value);
}

/**
 * 
 */
var FloatProperty = exports.FloatProperty = function() {
}

FloatProperty.prototype.init = function(constructor, propName) {
}

FloatProperty.prototype.getValueForDatastore = function(value) {
	return value;
}

FloatProperty.prototype.makeValueFromDatastore = function(value) {
 	return Number(value);
}

/**
 * 
 */
var DateProperty = exports.DateProperty = function(options) {
}

var JDate = java.util.Date;

DateProperty.prototype.init = function(constructor, propName) {
}

DateProperty.prototype.getValueForDatastore = function(value) {
	if (value)
		return new JDate(value.getTime());
	else
		return null;
}

DateProperty.prototype.makeValueFromDatastore = function(value) {
	if (value) 
		return new Date(value.getTime());
	else
		return null;
}

/**
* 
*/
var ReferenceProperty = exports.ReferenceProperty = function(refConstructor, options) {
}

ReferenceProperty.prototype.getValueForDatastore = function(value) {
   return value;
}

ReferenceProperty.prototype.makeValueFromDatastore = function(value) {
   return value;
}
