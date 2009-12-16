// TODO: try to remove this file.

var JKey = Packages.com.google.appengine.api.datastore.Key,
    JEntity = Packages.com.google.appengine.api.datastore.Entity;

var Key = require("google/appengine/api/datastore/types").Key;

// A map from kind strings to kind constructors.
var kindMap = exports.kindMap = {};

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
    return constructor.fromEntity(entity);
}

/**
 * Convert an object to a GAE DataStore entity.
 * Uses the metadata in the constructor.model to convert the object properties.
 */
exports.objectToEntity = function(obj) {
    return obj._toEntity();
}

