var KindError = require("google/appengine/ext/db/errors").KindError;

var db = require("google/appengine/ext/db"),
    Query = db.Query,
    ListProperty = db.ListProperty,
    kindMap = db.kindMap;

var JDatastore = require("google/appengine/api/datastore").Datastore,
    JEntity = Packages.com.google.appengine.api.datastore.Entity;

var jcontext = Packages.org.mozilla.javascript.Context.getCurrentContext(),
    JArrays = java.util.Arrays;

var Key = require("google/appengine/api/datastore/types").Key;

var argsArray = Array.prototype.splice,
    isArray = Array.isArray;

var Hash = require("hash").Hash;

var initProperties = function(constructor) {
    var properties = constructor.model.properties;
    
	for (var name in properties) {
	    var property = properties[name];
		property.name = name;
		property.init(constructor);
    }
}

/** 
 * The Model is the 'superclass' for data model definitions.
 */
var Model = exports.Model = function(constructor, kind, properties) {
	Model.extend(constructor, kind, properties);
	return constructor.model;
}

Model.extend = function(constructor, kind, properties) {
    constructor.model = {
        kind: kind,
        properties: this.model ? Hash.merge(this.model.properties, properties) : properties
    }

    initProperties(constructor);

	constructor.__proto__ = this;
	constructor.prototype.__proto__ = this.prototype;

	db.kindMap[kind] = constructor;    
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
    	throw new Error("Not implemented");
	} else {
		keys = db.key({parent: parent, kind: this.kind(), name: names});
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

Model.prototype.key = function() {
	return this.__key__;
}

Model.prototype.datastoreKey = function() {
	return this.__key__.__key__;
}

Model.prototype.parent = function() {
	var pkey = this.__key__.parent();
	return (pkey ? db.get(pkey) : null);
}

Model.prototype.parentKey = function() {
	return this.__key__.parent();
}

Model.prototype.put = function() {
	return db.put(this);
}

Model.prototype.remove = Model.prototype.DELETE = function() {
    return db.remove(this.__key__);
}

Model.fromEntity = function(entity) {
    var properties = this.model.properties;

    // Allocate a new object instance without calling the constructor.
	var obj = Object.create(this.prototype);
    
	for (var prop in Iterator(entity.getProperties().entrySet())) {
	    var pname = prop.getKey();
	    var property = properties[pname];
	    if (undefined != property) // THINK: extra safety for changing schemas?
	    	obj[pname] = property.makeValueFromDatastore(prop.getValue());
	}
	
	obj.__key__ = Key.fromDatastoreKey(entity.getKey());
	
	return obj;
}

Model.prototype.toEntity = function() {
    var entity = new JEntity(this.datastoreKey()); 
    var properties = this.constructor.model.properties;

    for (var pname in properties) {
	    var property = properties[pname];
        var value = property.getValueForDatastore(this);
    	if (undefined != value) {
    		entity.setProperty(pname, value);
        }
    }

	return entity;
}

// -----------------------------------------------------------------------------

var jcontext = Packages.org.mozilla.javascript.Context.getCurrentContext(),
    JArrays = java.util.Arrays;
    
/**
 * Property representing class-key property of a polymorphic class.
 * 
 * The class key is a list of strings describing an polymorphic instances
 * place within its class hierarchy.  This property is automatically calculated.
 */
var ClassKeyProperty = function(options) {
    ListProperty.call(this, options);
    this.type = "String";
    this.datastoreClassKey = JArrays.asList(jcontext.getElements(this.classKey));
}

ClassKeyProperty.prototype = ListProperty.prototype;

ClassKeyProperty.prototype.getValueForDatastore = function(obj) {
    return this.datastoreClassKey;
}

ClassKeyProperty.prototype.makeValueFromDatastore = function(value) {
    return this.classKey;
}

/**
 *
 */
var PolyModel = exports.PolyModel = function(constructor, kind, properties) {
	this.extend(constructor, kind, properties);
	return constructor.model;
}

for (var i in Model) PolyModel[i] = Model[i];
for (var i in Model.prototype) PolyModel.prototype[i] = Model.prototype[i];

PolyModel.extend = function(constructor, kind, properties) {
    if (this.__root_class__) {
        constructor.__root_class__ = this.__root_class__;
        constructor.__class_hierarchy__ = this.__class_hierarchy__;
        constructor.__class_hierarchy__.push(kind);
    } else {
        constructor.__class_hierarchy__ = [kind];
        constructor.__root_class__ = constructor;
    }    

    properties["class"] = new ClassKeyProperty({classKey: constructor.__class_hierarchy__});
    
    constructor.model = {
        kind: kind,
        properties: this.model ? Hash.merge(this.model.properties, properties) : properties
    }

    initProperties(constructor);

	constructor.__proto__ = this;
	constructor.prototype.__proto__ = this.prototype;

	db.kindMap[constructor.__class_hierarchy__.join("")] = constructor;
}

/**
 * Returns the name of the class and the names of all parent classes for the 
 * class, as a tuple.
 */
PolyModel.classKey = function() {
    return this.__class_hierarchy__;
}

/**
 * Returns the name of the class. A class can override this method if the name 
 * of the JavaScript class changes, but entities should continue using the 
 * original class name.
 */
PolyModel.className = function() {
    return this.model.kind;
}

PolyModel.kind = function() {
    if (this == this.__root_class__) {
        return this.model.kind;
    } else {
        return this.__root_class__.model.kind;
    }
}

PolyModel.all = function() {
    var query = new Query(this.__root_class__);
    if (this != this.__root_class__) {
        query.filter("class =", this.className());
    }
    return query;
}

PolyModel.fromEntity = function(entity) {
    var value = entity.getProperty("class");
    if (value) {
        var kind = kindMap[jcontext.newArray(global, value.toArray()).join("")];
        if (kind) {
            return Model.fromEntity.call(kind, entity);
        } else {
            throw new KindError("No implementation for class");  
        }
    } else {
        throw new KindError("No class property");
    }
}

