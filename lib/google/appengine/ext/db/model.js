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

/** 
 * The Model is the 'superclass' for data model definitions.
 */
var Model = exports.Model = function(constructor, kind, properties) {
	Model.extend(constructor, kind, properties);
	return constructor.model;
}

/**
 * kind, properties are optional.
 */
Model.extend = function(constructor, kind, properties) {
    // Inject the model methods.
	constructor.__proto__ = this;
	constructor.prototype.__proto__ = this.prototype;

    // If extending a model, copy the model definition.
    if (this.model) {
        constructor.model = {
            kind: this.model.kind,
            properties: Hash.merge(this.model.properties, {})
        }    
    }	

    // If the model definition is passed, apply it.
    if (kind) {
	    constructor.defineModel(kind, properties || {});
	}	
		
	return constructor;
}

Model.kind = function() {
	return this.model.kind;
}

Model.properties = function() {
	return this.model.properties;
}

// Initialize the properties for the constructor. 
// WARNING: Will possibly change or get removed in the Future.
Model.initProperties = function(properties) {
	for (var name in properties) {
	    var property = properties[name];
		property.name = name;
		property.init(this);
    }
    
    return properties;
}

/**
 * Update the properties of the Model.
 */
Model.updateProperties = function(properties) {
    Hash.update(this.model.properties, this.initProperties(properties)); 
}

/**
 * Define the kind and properties of the Model.
 * Attempt to emulate the Python Class Model definition.
 */
Model.defineModel = function(kind, properties) {
    properties = properties || {};
    
    this.model = {
        kind: kind,
        properties: this.model ? Hash.merge(this.model.properties, properties) : properties
    }

    this.initProperties(this.model.properties);

	db.kindMap[kind] = this;    
}

/**
 * Gets the model instance (or instances) for the given Key objects. The keys 
 * must represent entities of the model's kind. If a provided key is not of the 
 * correct kind, a KindError is raised.
 *
 * This method is similar to the db.get() function, with additional type checking.
 * 
 * Arguments:
 * 
 * keys = A Key object or a list of Key objects. 
 *        Can also be a string version of a Key object, or list of strings.
 */
Model.get = function(keys) {
    if (isArray(keys)) {
        if (typeof(keys[0]) == "string") {        
            keys = keys.map(function(k) { new db.Key(k) });
        }
    } else {
        if (typeof(keys) == "string") {        
            keys = new db.Key(keys);
        }
    }

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

Model.getById = function(ids, parent) {
	var keys;
	
	if (isArray(ids)) {
    	throw new Error("Not implemented");
	} else {
    	throw new Error("Not implemented");
//		keys = db.key({parent: parent, kind: this.kind(), name: ids});
	}

	return this.get(keys);
}

Model.getByKeyName = function(names, parent) {
	var keys;
	
	if (isArray(names)) {
        keys = names.map(function(n) { new db.Key({parent: parent, kind: this.kind(), name: n}) });
	} else {
		keys = db.key({parent: parent, kind: this.kind(), name: names});
	}

	return this.get(keys);
}

/**
 * Get or create an entity of the model's kind with the given key name, using a 
 * single transaction. The transaction ensures that if two users attempt to 
 * get-or-insert the entity with the given name simultaneously, then both users 
 * will have a model instance that refers to the entity, regardless of which 
 * process created it.
 *
 * - name:
 *   the name of the instance.
 * - options:
 *   Options to pass to the model class if an instance with the specified key name 
 *   doesn't exist. The parent argument is required if the desired entity has a 
 *   parent.
 */
Model.getOrInsert = function(name, options) {	
    var obj, 
        self = this;

    db.runInTransaction(function() {
        obj = self.getByKeyName(name, options.parent);
        if (!obj) {
            obj = Object.create(self.prototype);
            for (var i in options) {
                if (i != "parent") obj[i] = options[i];
            }
            obj.__key__ = db.key({kind: self.kind(), parent: options.parent, name: name});
            obj.put();
        }
    });
        
    return obj;
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
    return db.get(this.__key__.parent());
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

ClassKeyProperty.prototype = Object.create(ListProperty.prototype);

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

/**
 * kind, properties are optional.
 */
PolyModel.extend = function(constructor, kind, properties) {
    // Inject the model methods.
	constructor.__proto__ = this;
	constructor.prototype.__proto__ = this.prototype;

    // If the extender has __root_class__/__class_hierarchy__ (ie, is not
    // the PolyModel constructor) pass them to the extended constructor, else
    // initialize.
    if (this.__root_class__) {
        constructor.__root_class__ = this.__root_class__;
        constructor.__class_hierarchy__ = this.__class_hierarchy__;
    } else {
        constructor.__root_class__ = constructor;
        constructor.__class_hierarchy__ = [];
    }    

    // If extending a model, copy the model definition.
    if (this.model) {
        constructor.model = {
            kind: this.model.kind,
            properties: Hash.merge(this.model.properties, {})
        }    
    }	

    // If the model definition is passed, apply it.
    if (kind) {
	    constructor.defineModel(kind, properties || {});
	}	
	
	return constructor;
}

PolyModel.defineModel = function(kind, properties) {
    properties = properties || {};

    properties["class"] = new ClassKeyProperty({classKey: this.__class_hierarchy__});
    
    this.model = {
        kind: kind,
        properties: this.model ? Hash.merge(this.model.properties, properties) : properties
    }

    this.initProperties(this.model.properties);

    // grow the hierarchy.
    this.__class_hierarchy__.push(kind);

	db.kindMap[this.__class_hierarchy__.join("")] = this;
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

