var JKey = Packages.com.google.appengine.api.datastore.Key;

// A map from kind strings to kind constructors.
var kindMap = exports.kindMap = {};

/**
 * Resolve an object or a key.
 */
exports.resolveKey = function(objOrKey) {
	if (!objOrKey) return null; 
	if (objOrKey instanceof JKey)
		return objOrKey;
	else
		return objOrKey.key();
}

/**
 * Helper to copy properties from a trait/mixin.
 */
exports.copyProperties = function(base, src) {
    var properties = base.model.properties;
    
    for (var name in src) {
        var srcproperty = src[name];
        var property = properties[name] = new srcproperty.constructor;
        for (var i in srcproperty) property[i] = srcproperty[i];
        property.name = name;
        property.init(base); 
    }
}

/**
 * Convert a GAE DataStore entity to an object.
 * Uses the metadata in the constructor.model to convert the object properties.
 */
exports.entityToObject = function(entity) {
	var constructor = kindMap[entity.getKind()];
    var properties = constructor.model.properties;

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

/**
 * Convert an object to a GAE DataStore entity.
 * Uses the metadata in the constructor.model to convert the object properties.
 */
exports.objectToEntity = function(obj) {
	var model = obj.constructor.model;
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

