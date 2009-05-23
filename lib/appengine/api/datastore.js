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

/**
 * 
 */
exports.query = function(query, objClass) {
    objClass = objClass || Object;
        
    var objects = [];
    var entities = Store.prepare(query).asIterator();
    
    for (var e in Iterator(entities)) {
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
 * Delete all entities of the given Kind.
 */
exports.deleteKind = function(kind) {
    var query = new Query(kind);
    var entities = Store.prepare(query).asIterator();

    for (var e in Iterator(entities)) {
    	Store['delete'](e.getKey());
    }	
}