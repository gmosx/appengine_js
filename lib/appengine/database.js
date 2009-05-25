// Database interface to the Google App Engine Datastore. 

var datastore = require("appengine/api/datastore");

var Datastore = datastore.Datastore,
	Enitity = datastore.Entity;

exports.Query = datastore.Query;

/**
 * A query result.
 * @param entities
 * @return
 */
var Result = function(entities) {
	this.entities = entities;
}

/**
 * 
 */
Result.prototype.forEach = function() {
}

/**
 * Return many objects.
 */
// TODO: optimize, get keys values separately.
// TODO: cache properties in class.
Result.prototype.all = function(objClass) {
    objClass = objClass || Object;

    var objects = [];

    for (var e in Iterator(this.entities)) {
    	var obj = new objClass();
    	var properties = e.getProperties().entrySet();
    	for (var prop in Iterator(properties)) {
    		obj[prop.getKey()] = prop.getValue();
    	}
    	objects.push(obj)
    }	
	
    return objects;
}

/**
 * Return one object.
 */
Result.prototype.one = function(objClass) {
    objClass = objClass || Object;

    for (var e in Iterator(this.entities)) {
    	var obj = new objClass();
    	var properties = e.getProperties().entrySet();
    	for (var prop in Iterator(properties)) {
    		obj[prop.getKey()] = prop.getValue();
    	}
        return obj;
    }	
}

/**
 * 
 */
exports.query = function(query, objClass) {
    return new Result(Datastore.prepare(query).asIterator());
}

/**
 * 
 */
exports.put = function(obj) {
	 var model = obj.constructor.Model;
	 var properties = model.properties;
	 var entity = new Entity(model.table, obj.key);
	 for (var i in properties) {
		 var prop = properties[i];
		 entity.setProperty(prop, obj[prop]);
	 }
	 Datastore.put(entity);
}
 
/**
 * 
 */
exports.get = function(key) {
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