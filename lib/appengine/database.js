// Database interface to the Google App Engine Datastore. 

// TODO: transactions
// TODO: handle collections
var datastore = require("appengine/api/datastore");

var Datastore = datastore.Datastore,
	Enitity = datastore.Entity;

exports.Query = datastore.Query;
exports.Entity = datastore.Entity;
exports.KeyFactory = datastore.KeyFactory;

var entityToObject = function(entity, klass) {
	var obj = new klass();
	for (var prop in Iterator(entity.getProperties().entrySet())) {
		obj[prop.getKey()] = prop.getValue();
	}
	return obj;
}

var objectToEntity = function(obj) {
    var model = obj.constructor.Model;
	var properties = model.properties;
	
	var entity = obj.createEntity();
 
	for (var i in properties) {
		var prop = properties[i];
		entity.setProperty(prop, obj[prop]);
	}
 
	return entity;
}

/**
 * A query result.
 */
var Result = function(entities) {
	this.entities = entities;
}

/**
 * Iterate over the result, pass each deserialized object to the provided 
 * function.
 */
Result.prototype.forEach = function(func, klass) {
    klass = klass || Object;

    for (var e in Iterator(this.entities))
    	func(entityToObject(e, klass));
}
 
/**
 * Return many objects.
 */
// TODO: optimize, get keys values separately.
// TODO: cache properties in class.
Result.prototype.all = function(klass) {
    klass = klass || Object;

    var objects = [];
    for (var e in Iterator(this.entities))
    	objects.push(entityToObject(e, klass));
	
    return objects;
}

/**
 * Return one object.
 */
Result.prototype.one = function(objClass) {
    objClass = objClass || Object;

    for (var e in Iterator(this.entities))
    	return entityToObject(e, klass);
}
 
/**
 * 
 */
exports.query = function(query, objClass) {
    return new Result(Datastore.prepare(query).asIterator());
}

/**
 * TODO: handle parent!
 */
exports.put = function(obj) {
	Datastore.put(objectToEntity(obj));
}
 
/**
 * 
 */
exports.get = function(key, klass) {
	var entity = Datastore.get(key);
    
    if (klass)
    	return entityToObject(entity, klass)
    else
    	return entity;
}
 
/** 
 * Delete all entities that match the given query.
 */
exports.deleteAll = function(query) {
    if (typeof(query) == "string") 	 
    	query = new Query(kind);
    
	var entities = Datastore.prepare(query).asIterator();
	
	for (var e in Iterator(entities)) {
		Datastore['delete'](e.getKey());
	}	
}