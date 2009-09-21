var	JText = Packages.com.google.appengine.api.datastore.Text,
	JBlob = Packages.com.google.appengine.api.datastore.Blob,
	JGeoPt = Packages.com.google.appengine.api.datastore.GeoPt;

var jcontext = Packages.org.mozilla.javascript.Context.getCurrentContext(),
    JArrays = java.util.Arrays;

var ByteString = require("binary").ByteString;

var BadValueError = require("google/appengine/ext/db/errors").BadValueError;

var types = require("google/appengine/api/datastore/types"),
    Key = types.Key;
    GeoPt = types.GeoPt;
    
/**
 * The Property class is the superclass of property definitions for data models. 
 * A Property class defines the type of a property's value, how values are 
 * validated, and how values are stored in the datastore.
 *
 * Arguments:
 * - verboseName
 * - name
 * - defaultValue
 * - required
 * - validator
 * - choices
 * - indexed
 */
var Property = function(options) {
    for (var i in options) this[i] = options[i];
    if (this.required == undefined) this.required = false;
    if (this.indexed == undefined) this.indexed = true;
}

Property.prototype.validate = function(value) {
    if (this.empty(value)) {
        if (this.required) throw new BadValueError("Property " + this.name + " is required");    
    } else {
        if (this.choices) {
            var match = false;
            for (var i = 0; i < this.choices.length; i++) 
                if (this.choices[i] == value) match = true;
            if (!match)
                throw new BadValueError("Property " + this.name + " is " + value + "; must be one of " + this.choices);
        }
    }

    if (this.validator) this.validator(value);
    
    return value;
}

Property.prototype.empty = function(value) {
    return value == undefined || value == null;
}

var extend = function(Klass, Zuper) {
    Klass.prototype = Object.create(Zuper.prototype);
    Klass.prototype.constructor = Klass;
}

/**
 * 
 */
var StringProperty = exports.StringProperty = function(options) {
    Property.call(this, options);
}

extend(StringProperty, Property);

StringProperty.prototype.init = function(constructor) {
}

StringProperty.prototype.getValueForDatastore = function(obj) {
    return obj[this.name];
}

StringProperty.prototype.makeValueFromDatastore = function(value) {
    return String(value);
}

/**
 * 
 */
var BooleanProperty = exports.BooleanProperty = function(options) {
    Property.call(this, options);
}

extend(BooleanProperty, Property);

BooleanProperty.prototype.init = function(constructor) {
}

BooleanProperty.prototype.getValueForDatastore = function(obj) {
    return obj[this.name];
}

BooleanProperty.prototype.makeValueFromDatastore = function(value) {
	return value.booleanValue();
}

/**
 * 
 */
var IntegerProperty = exports.IntegerProperty = function(options) {
    Property.call(this, options);
}

extend(IntegerProperty, Property);

IntegerProperty.prototype.init = function(constructor) {
}

IntegerProperty.prototype.getValueForDatastore = function(obj) {
    return obj[this.name];
}

IntegerProperty.prototype.makeValueFromDatastore = function(value) {
	return Number(value);
}

/**
 * 
 */
var FloatProperty = exports.FloatProperty = function(options) {
    Property.call(this, options);
}

extend(FloatProperty, Property);

FloatProperty.prototype.init = function(constructor) {
}

FloatProperty.prototype.getValueForDatastore = function(obj) {
    return obj[this.name];
}

FloatProperty.prototype.makeValueFromDatastore = function(value) {
 	return Number(value);
}

/**
 * 
 */
var DateProperty = exports.DateProperty = function(options) {
    Property.call(this, options);
}

extend(DateProperty, Property);

var JDate = java.util.Date;

DateProperty.prototype.init = function(constructor) {
}

DateProperty.prototype.getValueForDatastore = function(obj) {
    var value = this.addNow ? new Date() : obj[this.name];

	if (value)
		return new JDate(value.getTime());
	else
	    return this.addNowAdd ? new Date() : null;
}

DateProperty.prototype.makeValueFromDatastore = function(value) {
	if (value) 
		return new Date(value.getTime());
	else
		return null;
}

/**
 * 
 */
var DateTimeProperty = exports.DateTimeProperty = DateProperty;
DateTimeProperty.constructor = DateTimeProperty;

/**
 * 
 */
var TimeProperty = exports.TimeProperty = DateProperty;
TimeProperty.constructor = TimeProperty;

/**
 * A list of values of the type given as item_type.
 * In a query, comparing a list property to a value performs the test against 
 * the list members: list_property = value tests if the value appears anywhere 
 * in the list, list_property < value tests if any of the members of the list 
 * are less than the given value, and so forth.
 * A query cannot compare two list values. There is no way to test two lists for 
 * equality without testing each element for membership separately.
 */
var ListProperty = exports.ListProperty = function(options) {
    Property.call(this, options);
}

extend(ListProperty, Property);

ListProperty.prototype.init = function(constructor) {
}

ListProperty.prototype.getFilterValue = function(val) {
    return val;
}

ListProperty.prototype.getValueForDatastore = function(obj) {
    return JArrays.asList(jcontext.getElements(obj[this.name] || []));
}

ListProperty.prototype.makeValueFromDatastore = function(value) {
    return jcontext.newArray(global, value.toArray());
}

/**
 * A reference to another model instance. For example, a reference may indicate 
 * a many-to-one relationship between the model with the property and the model 
 * referenced by the property.
 *
 * Extra options:
 * - referenceClass
 * - collectionName
 */
var ReferenceProperty = exports.ReferenceProperty = function(options) {
    Property.call(this, options);
}

extend(ReferenceProperty, Property);

ReferenceProperty.prototype.init = function(constructor) {
    if (this.referenceClass) {
        var name = this.name;
        var propCache = "__" + name + "_cache__";
        var referenceClass = this.referenceClass;
        
        constructor.prototype["get_" + name] = function() {
            if (undefined == this[propCache]) {
                var value = referenceClass.get(this[name]);
                if (!value) throw new Error("ReferenceProperty failed to be resolved");
                this[propCache] = value;
            }
            
            return this[propCache];
        }

        this.collectionName = this.collectionName || constructor.model.kind.toLowerCase() + "Set";

        referenceClass.prototype[this.collectionName] = function() {
            return constructor.all().filter(name + " =", this.datastoreKey());
        } 
    }
}

ReferenceProperty.prototype.getValueForDatastore = function(obj) {
    var value = obj[this.name];
    return value ? value.datastoreKey() : null;
}

ReferenceProperty.prototype.makeValueFromDatastore = function(value) {
    return Key.fromDatastoreKey(value);
}

/**
 * This is an extension of the Python API.
 */
var ObjectProperty = exports.ObjectProperty = function(options) {
    Property.call(this, options);
}

extend(ObjectProperty, Property);

ObjectProperty.prototype.init = function(constructor) {
}

ObjectProperty.prototype.getValueForDatastore = function(obj) {
    var value = obj[this.name];
    return value ? JSON.stringify(value) : null;
}

ObjectProperty.prototype.makeValueFromDatastore = function(value) {
    return JSON.parse(String(value));
}

/**
 * A user with a Google account.
 * If autoCurrentUser is true, the property value is set to the currently 
 * signed-in user whenever the model instance is stored in the datastore, 
 * overwriting the property's previous value. This is useful for tracking which 
 * user modifies a model instance.
 * If autoCurrentUserAdd is true, the property value is set to the currently 
 * signed-in user the first time the model instance is stored in the datastore, 
 * unless the property has already been assigned a value. This is useful for 
 * tracking which user creates a model instance, which may not be the same 
 * user that modifies it later.
 * UserProperty does not accept a default value. Default values are set when 
 * the model class is first imported, and with import caching may not be the 
 * currently signed-in user.
 */
var UserProperty = exports.UserProperty = function(options) {
    Property.call(this, options);
}

extend(UserProperty, Property);

UserProperty.prototype.init = function(constructor) {
}

UserProperty.prototype.getValueForDatastore = function(obj) {
    return new Error("not implemented");
}

UserProperty.prototype.makeValueFromDatastore = function(value) {
    return new Error("not implemented");
}

/**
 * A binary data property.
 * Blob data is a byte string. For text data, which may involve encoding, 
 * use TextProperty.
 */
var BlobProperty = exports.BlobProperty = function(options) {
    Property.call(this, options);
}

extend(BlobProperty, Property);

BlobProperty.prototype.init = function(constructor) {
}

BlobProperty.prototype.getValueForDatastore = function(obj) {
    return new JBlob(obj[this.name]._bytes);
}

BlobProperty.prototype.makeValueFromDatastore = function(value) {
    var b = new ByteString();
    b._bytes = value.getBytes();
    b._offset = 0;
    b._length = Number(b._bytes.length);
    return b;
}

/**
 *
 */
var TextProperty = exports.TextProperty = function(options) {
    Property.call(this, options);
}

extend(TextProperty, Property);

TextProperty.prototype.init = function(constructor) {
}

TextProperty.prototype.getValueForDatastore = function(obj) {
    return new JText(obj[this.name]);
}

TextProperty.prototype.makeValueFromDatastore = function(value) {
    return String(value.getValue());
}

/**
 *
 */
var EmailProperty = exports.EmailProperty = StringProperty;
EmailProperty.constructor = EmailProperty;

/**
 * 
 */
var GeoPtProperty = exports.GeoPtProperty = function(options) {
    Property.call(this, options);
}

extend(GeoPtProperty, Property);

GeoPtProperty.prototype.init = function(constructor) {
}

GeoPtProperty.prototype.getValueForDatastore = function(obj) {
    var pt = obj[this.name];
    return new JGeoPt(pt.lat, pt.lon);
}

GeoPtProperty.prototype.makeValueFromDatastore = function(value) {
 	return new GeoPt(value.getLatitude(), value.getLongitude());
}

/**
 *
 */
var PhoneNumberProperty = exports.PhoneNumberProperty = StringProperty;
PhoneNumberProperty.constructor = PhoneNumberProperty;

/**
 *
 */
var PostalAddressProperty = exports.PostalAddressProperty = StringProperty;
PostalAddressProperty.constructor = PostalAddressProperty;

/**
 *
 */
var RatingProperty = exports.RatingProperty = IntegerProperty;
RatingProperty.constructor = RatingProperty;

