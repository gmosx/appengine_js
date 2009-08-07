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
	JEntityNotFoundException = Packages.com.google.appengine.api.datastore.EntityNotFoundException,
	JKey = Packages.com.google.appengine.api.datastore.Key,
	JFetchOptions = Packages.com.google.appengine.api.datastore.FetchOptions,
	JFetchOptionsBuilder = Packages.com.google.appengine.api.datastore.FetchOptions.Builder,
	JText = Packages.com.google.appengine.api.datastore.Text,
    argsArray = Array.prototype.splice,
    isArray = Array.isArray;

// A map from kind strings to kind constructors.
var kindMap = {};

var resolveKey = exports.resolveKey = function(objOrKey) {
	if (!objOrKey) return null; 
	if (objOrKey instanceof JKey)
		return objOrKey;
	else
		return objOrKey.key();
}

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
	var entity = model.createEntity(obj);

    for (var pname in properties) {
    	var property = properties[pname];
        var value = property.getValueForDatastore(obj);
    	if (undefined != value)
    		entity.setProperty(pname, value);
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
	"=": DatastoreQuery.FilterOperator.EQUAL,
	">": DatastoreQuery.FilterOperator.GREATER_THAN,
	">=": DatastoreQuery.FilterOperator.GREATER_THAN_OR_EQUAL,
	"<": DatastoreQuery.FilterOperator.LESS_THAN,
	"<=": DatastoreQuery.FilterOperator.LESS_THAN_OR_EQUAL
}

/**
 * Adds a property condition filter to the query. Only entities with properties 
 * that meet all of the conditions will be returned by the query.
 */
Query.prototype.filter = function(property_op, value) {
	var parts = property_op.split(" ");
	var property = this.model.properties[parts[0]];
	var obj = {};
	obj[property.name] = value;
	this.query.addFilter(parts[0], FILTER_OPERATORS[parts[1]], property.getValueForDatastore(obj));
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

Query.prototype.ancestor = function(ancestor) {
    this.query.setAncestor(resolveKey(ancestor));
    return this;
}

Query.prototype.keysOnly = function() {
    this.query.setKeysOnly();
    return this;
}

Query.prototype.limit = function(limit) {
	this.fetchOptions = JFetchOptionsBuilder.withLimit(limit);
	return this;
}

Query.prototype.offset = function(offset) {
	if (!this.fetchOptions) throw Error("Call .limit(n) before calling .offset(n)");
	this.fetchOptions = this.fetchOptions.offset(offset);
	return this;
}

Query.prototype.get = function() {
    if (!this.prepared) this.prepared = Datastore.prepare(this.query);

	entities = this.prepared.asIterator(JFetchOptionsBuilder.withLimit(1));

    if (this.query.isKeysOnly())
	    for (var e in Iterator(entities))
	    	return e.getKey();
    else
	    for (var e in Iterator(entities))
	    	return entityToObject(e);
}

/**
 *
 */
Query.prototype.fetch = function(limit, offset) {
    if (!this.prepared) this.prepared = Datastore.prepare(this.query);

    var objects = [];
    
    var entities;
    if (this.fetchOptions) 
    	entities = this.prepared.asIterator(this.fetchOptions);
    else
    	entities = this.prepared.asIterator();
    
    if (this.query.isKeysOnly())
	    for (var e in Iterator(entities))
	    	objects.push(e.getKey());
    else
	    for (var e in Iterator(entities))
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
	var objs = exports.get(keys);

	if (objs) {
		var kind = this.kind();
		var arr = isArray(objs) ? objs : [objs];
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].constructor.kind() != kind) 
				throw new KindError("Instance is of kind '" + arr[i].constructor.kind() + "', expected kind is '" + kind + "'");
		}
	}
	
	return objs;
}

Model.getById = function(ids) {
}

Model.getByKeyName = function(names, parent) {
	var keys;
	
	if (isArray(names)) {
	} else {
		keys = exports.key(resolveKey(parent), this.kind(), names);
	}

	return this.get(keys);
}

Model.getOrInsert = function(name, options) {	
}

Model.all = function() {
	return new Query(this);
}

Model.gql = function(gql) {
	throw new Error("Not implemented");
}

Model.entityToObject = entityToObject;

Model.objectToEntity = objectToEntity;

Model.prototype.setKey = function(key) {
	this.__key__ = key;
}

Model.prototype.key = Model.prototype.getKey = function() {
	return this.__key__;
}

Model.prototype.parent = function() {
	var pkey = this.__key__.getParent();
	return (pkey ? exports.get(pkey) : null);
}

Model.prototype.parentKey = function() {
	return this.__key__.getParent();
}

Model.prototype.put = function() {
	return exports.put(this);
}

Model.prototype.remove = Model.prototype.DELETE = function() {
    return exports.remove(this.__key__);
}

// TODO: make this work along Object.extend/Object.include!
exports.model = function(constructor, kind, properties, model) {
	if (!model) model = {};
	model.kind = kind;
	model.properties = properties;
	
	constructor.Model = model;

	for (var propName in properties) {
	    var property = properties[propName];
		property.name = propName;
		property.init(constructor);
    }
    
	kindMap[kind] = constructor;
	
	constructor.__proto__ = Model;
	constructor.prototype.__proto__ = Model.prototype;

	model.createEntity = function(obj) { 
		return new Entity(kind, obj.__key__.getName(), obj.__key__.getParent()); 
	}
	
	return model;
}

// -----------------------------------------------------------------------------
// Properties

/**
 * 
 */
var StringProperty = exports.StringProperty = function() {
}

StringProperty.prototype.init = function(constructor) {
}

StringProperty.prototype.getValueForDatastore = function(obj) {
    return obj[this.name];
}

StringProperty.prototype.makeValueFromDatastore = function(value) {
    return String(value);
}

/**
 * 
 */
var IntegerProperty = exports.IntegerProperty = function() {
}

IntegerProperty.prototype.init = function(constructor) {
}

IntegerProperty.prototype.getValueForDatastore = function(obj) {
    return obj[this.name];
}

IntegerProperty.prototype.makeValueFromDatastore = function(value) {
	return Number(value);
}

/**
 * 
 */
var FloatProperty = exports.FloatProperty = function() {
}

FloatProperty.prototype.init = function(constructor) {
}

FloatProperty.prototype.getValueForDatastore = function(obj) {
    return obj[this.name];
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

DateProperty.prototype.init = function(constructor) {
}

DateProperty.prototype.getValueForDatastore = function(obj) {
    var value = obj[this.name];

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
var DateTimeProperty = exports.DateTimeProperty = DateProperty;

/**
* 
*/
var ReferenceProperty = exports.ReferenceProperty = function(refConstructor, collectionName) {
	this.refConstructor = refConstructor;
	this.collectionName = collectionName;
}

ReferenceProperty.prototype.init = function(constructor) {
    if (this.refConstructor) {
        var name = this.name;
        var propCache = "__" + name + "_cache__";
        var refConstructor = this.refConstructor;
        
        constructor.prototype["get_" + name] = function() {
            if (!this[propCache]) {
                var value = refConstructor.get(this[name]);
                if (!value) throw new Error("ReferenceProperty failed to be resolved");
                this[propCache] = value;
            }
            
            return this[propCache];
        }

        this.collectionName = this.collectionName || constructor.Model.kind.toLowerCase() + "Set";

        this.refConstructor.prototype[this.collectionName] = function() {
            return constructor.all().filter(name + " =", this.__key__);
        } 
    }
}

ReferenceProperty.prototype.getValueForDatastore = function(obj) {
    var value = obj[this.name];
    return value ? resolveKey(value) : null;
}

ReferenceProperty.prototype.makeValueFromDatastore = function(value) {
    return value;
}

/**
 * Extension of the Python API.
 */
var ObjectProperty = exports.ObjectProperty = function() {
}

ObjectProperty.prototype.init = function(constructor) {
}

ObjectProperty.prototype.getValueForDatastore = function(obj) {
    var value = obj[this.name];
    return value ? JSON.stringify(value) : null;
}

ObjectProperty.prototype.makeValueFromDatastore = function(value) {
    return JSON.parse(String(value));
}

/**
 *
 */
var TextProperty = exports.TextProperty = function() {
}

TextProperty.prototype.init = function(constructor) {
}

TextProperty.prototype.getValueForDatastore = function(obj) {
    return new JText(obj[this.name]);
}

TextProperty.prototype.makeValueFromDatastore = function(value) {
    return String(value.getValue());
}

/**
 *
 */
var EmailProperty = exports.EmailProperty = StringProperty;

/**
 *
 */
var PhoneNumberProperty = exports.PhoneNumberProperty = StringProperty;

/**
 *
 */
var PostalAddressProperty = exports.PostalAddressProperty = StringProperty;

/**
 *
 */
var RatingProperty = exports.RatingProperty = IntegerProperty;

