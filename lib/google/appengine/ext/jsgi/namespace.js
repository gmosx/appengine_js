/** 
 * @fileoverview Enable request namespace middelware. 
 */

var enableRequestNamespace = require("google/appengine/api/namespace-manager").enableRequestNamespace;

/**
 * Namespace JSGI middleware.
 *
 * Set the default namespace to the Google Apps domain referring 
 * this request.
 *
 * Calling this function will set the default namespace to the
 * Google Apps domain that was used to create the url used for 
 * this request and only for the current request and only if the 
 * current default namespace is unset.
 *
 * @see http://code.google.com/appengine/docs/java/multitenancy/multitenancy.html#Setting_the_Current_Namespace
 * @see http://code.google.com/appengine/docs/python/multitenancy/multitenancy.html#Setting_the_Current_Namespace
 */
exports.Namespace = exports.middleware = function (app) {
    return function (request) {
        enableRequestNamespace();
        return app(request);
    }   
}
