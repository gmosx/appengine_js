var db = require("google/appengine/ext/db"),
    Property = db.Property,
    utils = require("google/appengine/utils");

var	JText = Packages.com.google.appengine.api.datastore.Text;

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
 * This is an unindexed property.
 */
var JSONProperty = exports.JSONProperty = function(options) {
    Property.call(this, options);
    this.indexed = false;
}

utils.extend(JSONProperty, Property);

JSONProperty.prototype.init = function(constructor) {
}

JSONProperty.prototype.getValueForDatastore = function(obj) {
    var text = obj[this.name] || this.defaultValue;
    return text ? JText(JSON.stringify(text)) : undefined;
}

JSONProperty.prototype.makeValueFromDatastore = function(value) {
    return JSON.parse(String(value.getValue()));
}
