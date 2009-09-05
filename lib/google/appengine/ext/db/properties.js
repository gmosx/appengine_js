var	JText = Packages.com.google.appengine.api.datastore.Text,
	JBlob = Packages.com.google.appengine.api.datastore.Blob;

var ByteString = require("binary").ByteString;

var BadValueError = require("google/appengine/ext/db/errors").BadValueError,
    resolveKey = require("google/appengine/ext/db/utils").resolveKey;

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
    if (this.indexed == undefined) this.required = true;
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
            return constructor.all().filter(name + " =", this.__key__);
        } 
    }
}

ReferenceProperty.prototype.getValueForDatastore = function(obj) {
    var value = obj[this.name];
    return value ? resolveKey(value) : null;
}

ReferenceProperty.prototype.makeValueFromDatastore = function(value) {
    return value;
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

