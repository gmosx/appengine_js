var KindError = require("google/appengine/ext/db/errors").KindError;

var db = require("google/appengine/ext/db"),
    utils = require("google/appengine/ext/db/utils"),
    resolveKey = utils.resolveKey,
    Query = require("google/appengine/ext/db/query").Query;

var JEntity = Packages.com.google.appengine.api.datastore.Entity;

var argsArray = Array.prototype.splice,
    isArray = Array.isArray;

/** 
 * The Model is the 'superclass' for data model definitions.
 */
var Model = exports.Model = function(ctor, kind, properties) {
    return db.model(ctor, kind, properties);
}

Model.kind = function() {
	return this.model.kind;
}

Model.properties = function() {
	return this.model.properties;
}

Model.get = function(keys) {
	var objs = db.get(keys);

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
		keys = db.key(resolveKey(parent), this.kind(), names);
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
/*
Model.entityToObject = utils.entityToObject;

Model.objectToEntity = utils.objectToEntity;
*/
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

Model.prototype.put = function() {
	return db.put(this);
}

Model.prototype.remove = Model.prototype.DELETE = function() {
    return db.remove(this.__key__);
}

// TODO: make this work along Object.extend/Object.include!
db.model = function(constructor, kind, properties, model) {
	if (!model) model = {};
	model.kind = kind;
	model.properties = properties;
	
	constructor.model = model;

	for (var propName in properties) {
	    var property = properties[propName];
		property.name = propName;
		property.init(constructor);
    }
    
	db.kindMap[kind] = constructor;
	
	constructor.__proto__ = Model;
	constructor.prototype.__proto__ = Model.prototype;

	model.createEntity = function(obj) { 
		return new JEntity(kind, obj.__key__.getName(), obj.__key__.getParent()); 
	}
	
	return model;
}
