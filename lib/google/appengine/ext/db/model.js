var datastore = require("google/appengine/api/datastore"),
    JDatastore = datastore.Datastore,
    JEntity = datastore.Entity;

var objects = require("ringo/utils/objects");

var db = require("google/appengine/ext/db"),
    Query = db.Query,
    ListProperty = db.ListProperty,
    types = require("google/appengine/api/datastore/types"),
    Key = types.Key,
    errors = require("google/appengine/ext/db/errors"),
    KindError = errors.KindError,
    NotSavedError = errors.NotSavedError;

/**
 * Model is the superclass of all object entities in the datastore.
 *
 * A model instance can have a single parent.  Model instances without any
 * parent are root entities.  It is possible to efficiently query for
 * instances by their shared parent.  All descendents of a single root
 * instance also behave as a transaction group.  This means that when you
 * work one member of the group within a transaction all descendents of that
 * root join the transaction.  All operations within a transaction on this
 * group are ACID.
 *
 * @constructor
 */
var Model = exports.Model = function (kind, properties) {
    return Model.extend(kind, properties);
}

Model._properties = {};

Model._loadEntityValues = function (entity) {
    var values = {},
        properties = this.properties();

	for (var prop in Iterator(entity.getProperties().entrySet())) {
	    var pname = prop.getKey();
	    var property = properties[pname];
	    if (undefined != property) { // THINK: extra safety for changing schemas?
	    	values[pname] = property.makeValueFromDatastore(prop.getValue());
	    }
	}
	
	return values;
}

var _initializeProperties = function (modelClass, properties) {
	for (var pname in properties) {
	    var property = properties[pname];
		property.name = pname;
        if (property.init) {
    		property.init(modelClass);
        } else {
            throw new Error("Invalid property class for property '" + pname + "'");
        }
    }

    return properties;
}

/**
 * Extend the given Model (simulates Python class extensions).
 *
 * Examples:
 *  var Article = db.Model.extend("Article", {
 *      title: new db.StringProperty(),
 *      summary: new db.TextProperty()
 *  });
 *
 *  var Story = Article.extend("Story", {
 *      image: new db.BlobProperty(),
 *      author: new db.ReferenceProperty(User)
 *  });
 *
 * Alternative:
 *  var Article = db.Model.extend({
 *      _kind: "Article",
 *      title: new db.StringProperty(),
 *      summary: new db.TextProperty()
 *  });
 *
 })
 *
 */
Model.extend = function (kind, properties) {
    if (1 == arguments.length) {
        properties = kind;
        kind = properties._kind;
        delete properties._kind;
    }
    
    if (kind == undefined) {
        throw Error("The kind is undefined");
    }
    
    var ctor = function (data) {
        if (data) {
            if (data.key) {
                this.__key__ = data.key;
                delete data.key;
            } else if (data.keyName || data.parent) {
                this.__key__ = Key.create({kind: this.constructor.kind(), parent: data.parent, name: data.keyName});
                delete data.keyName;
                delete data.parent;
            }
            
            for (var pname in data) {
                this[pname] = data[pname];
            }
        }
    }   
    
//    ctor.__proto__ = this; // disabled in ringojs, use this alternative:
    var self = this;
    Object.keys(this).forEach(function (k) { ctor[k] = self[k] });
    
    ctor.prototype = Object.create(this.prototype);
    ctor.prototype.constructor = ctor;

    ctor._kind = kind;
	db.kindMap[kind] = ctor;        
    
    ctor._properties = objects.merge(this.properties(), _initializeProperties(ctor, properties));
    
    return ctor;
}

Model.kind = function () {
    return this._kind;
}

Model.properties = function () {
    return this._properties;
}

Model.updateProperties = function (newProperties) {
    this._properties = objects.merge(this._properties, _initializeProperties(this, newProperties));    
}

Model.fromEntity = function (entity) {
    if (this.kind() != String(entity.getKind())) {
        throw new KindError("Model " + this.kind() + " cannot handle " + entity.getKind());
    }
    
    var instance = new this(this._loadEntityValues(entity));
    instance._entity = entity;
    
    return instance;
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
Model.get = function (keys) {
    if (!keys) return;
    
    var objs = db.get(keys);

    if (!objs) return null;
    
	var kind = this.kind();
	var arr = Array.isArray(objs) ? objs : [objs];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].constructor.kind() != kind) 
			throw new KindError("Instance is of kind '" + arr[i].constructor.kind() + "', expected kind is '" + kind + "'");
	}
	
	return objs;
}

Model.getById = function (ids, parent) {
	var keys;
	
	if (Array.isArray(ids)) {
    	throw new Error("Not implemented");
	} else {
    	throw new Error("Not implemented");
	}

	return this.get(keys);
}

Model.getByKeyName = function (names, parent) {
	var keys;
	
	if (Array.isArray(names)) {
	    var self = this;
        keys = names.map(function (n) { return Key.create({parent: parent, kind: self.kind(), name: n}) });
	} else {
		keys = Key.create({parent: parent, kind: this.kind(), name: names});
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
 * - data:
 *   constructor data.
 */
Model.getOrInsert = function (keyName, data) {	
    var obj, 
        self = this;
        
    db.runInTransaction (function () {
        if (!data) data = {};
        obj = self.getByKeyName(keyName, data.parent);
        if (!obj) {
            data.keyName = keyName;
            obj = new self(data);
            obj.put();
        }
    });
        
    return obj;
}

Model.all = function () {
	return new Query(this);
}

Model.prototype._toEntity = function (entity) {
    var properties = this.constructor.properties();

    for (var pname in properties) {
	    var property = properties[pname];
        var value = property.getValueForDatastore(this);
    	if (value == undefined) {
            entity.removeProperty(pname);
        } else {
            if (property.indexed) {
    		    entity.setProperty(pname, value);
    	    } else {
    		    entity.setUnindexedProperty(pname, value);    	    
    	    }
        }
    }
}

Model.prototype._populateEntity = function () {
    var entity;
    
    if (this.isSaved()) {
        entity = this._entity;
    } else {
        var key = this.__key__ || Key.create({kind: this.constructor.kind()});
        entity = new JEntity(key.datastoreKey());
    }
    
    this._toEntity(entity);
    
    return entity;
}

Model.prototype._populateInternalEntity = function () {
    this._entity = this._populateEntity();   
    return this._entity;
}

Model.prototype.key = function () {
    if (this.__key__) {
        return this.__key__;
    } else if (this.isSaved()) {
        this.__key__ = Key.fromDatastoreKey(this._entity.getKey());
        return this.__key__; 
    } else {
        throw new NotSavedError("Not saved");
    }
}

// FIXME: optimize? API extension, used in db.js
Model.prototype.datastoreKey = function () {
	return this.key() ? this.key().__key__ : null;
}

Model.prototype.parent = function () {
    if (!this._parent) {
        var parentKey = this.parentKey();
        if (parentKey != undefined) {
            this._parent = db.get(parentKey);
        }
    }
    
    return this._parent;
}

Model.prototype.parentKey = function () {
    if (this._entity) {
        var jparentKey = this._entity.getParent();
        if (jparentKey) {
            return Key.fromDatastoreKey(this._entity.getParent());
        } else {
            return null;
        }            
    } else if (this.__key__) {
        return this.__key__.parent();
    }
}

Model.prototype.put = function () {
    this._populateInternalEntity();
    var jkey = JDatastore.put(this._entity);
    return Key.fromDatastoreKey(jkey);
}

/**
 * Deletes this entity from the datastore.
 * 
 * WARNING: 'delete' is a reserved word in JavaScript so model.remove() or
 * model.DELETE() are used instead!
 *
 * Throws:
 *   TransactionFailedError if the data could not be committed.
 *
 */
Model.prototype.remove = Model.prototype.DELETE = function () {
    db.remove(this.key());
    this._entity = null;
}

/**
 * Determine if entity is persisted in the datastore.
 *
 * New instances of Model do not start out saved in the data.  Objects which
 * are saved to or loaded from the Datastore will have a True saved state.
 */
Model.prototype.isSaved = function () {
    return this._entity;
}

Model.prototype.hasKey = function () {
    return this.isSaved() || this._key;
}

/**
 * Convert to a data object. First step to JSON conversion.
 */
Model.prototype.toData = function () {
    var data = {
        key: this.key().toString()
    }
  
    var properties = this.constructor.properties();
    
    for (var i in properties) {
        var prop = properties[i];
            
        data[prop.name] = this[prop.name];
    }
    
    return data;
} 

/**
 * Serialize model data to a JSON string.
 */
Model.prototype.toJSON = function () {
    return JSON.stringify(this.toData());
}
