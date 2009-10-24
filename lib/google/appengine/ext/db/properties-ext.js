/**
 * A library of useful App Engine datastore property classes, ported from
 * aetycon.
 * 
 * The property classes included here cover use cases that are too specialized to
 * be included in the SDK, or simply weren't included, but are nevertheless
 * generally useful. They include:
 *
 * http://github.com/Arachnid/aetycoon/
 */
  
/**
 * A property for storing complex objects in the datastore in serialized form.
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
