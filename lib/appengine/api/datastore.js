/**
 * http://code.google.com/appengine/docs/java/datastore/
 * http://code.google.com/appengine/docs/python/datastore/
 */

var DatastoreServiceFactory = Packages.com.google.appengine.api.datastore.DatastoreServiceFactory;

var Store = exports.Store = DatastoreServiceFactory.getDatastoreService(),
	KeyFactory = exports.KeyFactory = Packages.com.google.appengine.api.datastore.KeyFactory,
	Entity = exports.Entity = Packages.com.google.appengine.api.datastore.Entity,
	Query = exports.Query = Packages.com.google.appengine.api.datastore.Query;

// Helpers

var Result = function(entities) {
	this.entities = entities;
}

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
    return new Result(Store.prepare(query).asIterator());
}

/**
 * 
 */
exports.put = function(obj) {
	 var meta = obj.constructor.db;
	 var properties = meta.properties;
	 var entity = new Entity(meta.table, obj.key);
	 for (var i in properties) {
		 var prop = properties[i];
		 entity.setProperty(prop, obj[prop]);
	 }
	 Store.put(entity);
}
 
/**
 * 
 */
exports.get = function(key, objClass) {
}
 
/** 
 * Delete all entities of the given Kind.
 */
exports.deleteKind = function(kind) {
    var query = new Query(kind);
    var entities = Store.prepare(query).asIterator();

    for (var e in Iterator(entities)) {
    	Store['delete'](e.getKey());
    }	
}