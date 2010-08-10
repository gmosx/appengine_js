/**
 * @fileoverview System properties. Based on the Java API:
 * @see http://code.google.com/appengine/docs/java/javadoc/com/google/appengine/api/utils/SystemProperty.html
 * A Python API version will be added in a future version:
 * @see http://code.google.com/appengine/docs/python/runtime.html#The_Environment
 */
 
// TODO: implement Python API.

var JSystemProperty = Packages.com.google.appengine.api.utils.SystemProperty;

/**
 * Custom API to access system properties, based on the Java API.
 */
var SystemProperties = exports.SystemProperties = {};

Object.defineProperty(SystemProperties, "applicationId", {
    get: function () {
        return JSystemProperty.applicationId.get();        
    } 
});

Object.defineProperty(SystemProperties, "applicationVersion", {
    get: function () {
        return JSystemProperty.applicationVersion.get();        
    }
});

/**
 * The current executing environment. 
 * Has the values "Production" and "Development".
 *
 * Example:
 * var enviroment = require("google/appengine/api/utils").SystemProperties.environment;
 * Alternatives:
 * var environment = require("ringo/engine").properties["com.google.appengine.runtime.environment"];
 * var environment = java.lang.System.getProperty("com.google.appengine.runtime.environment")) 
 */
Object.defineProperty(SystemProperties, "environment", {
    get: function () {
        return JSystemProperty.environment.value();        
    }, 
    set: function (e) {
        JSystemProperty.environment.set(e);        
    }
});

Object.defineProperty(SystemProperties, "version", {
    get: function () {
        return JSystemProperty.version.get();        
    }
});
