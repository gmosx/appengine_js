/**
 * @fileoverview Control the namespacing system used by various APIs.
 *
 * A namespace may be specified in various API calls exemplified
 * by the datastore and memcache interfaces.  The default can be
 * specified using this module. 
 */

var JNamespaceManager = Packages.com.google.appengine.api.NamespaceManager;

/**
 * Raised by the validateNamespace() method when the namespace 
 * string is not valid. To be valid, namespace strings must match 
 * the regular expression ([0-9A-Za-z._-]{0,100}).
 */
exports.BadValueError = java.lang.IllegalArgumentException;

/**
 * Set the default namespace for the current HTTP request.
 * @param {string} namespace A string naming the new namespace to use. A value of undefined will unset the default namespace value.
 */
exports.setNamespace = function (namespace) {
	JNamespaceManager.set(namespace);
}

/**
 * Get the the current default namespace or ('') namespace if unset.
 */
exports.getNamespace = function () {
    return JNamespaceManager.get();
}

/**
 * Returns the Google Apps domain referring this request or 
 * otherwise the empty string ("").
 */
exports.getGoogleAppsNamespace = function () {
    return JNamespaceManager.getGoogleAppsNamespace();
}

/**
 * Set the default namespace to the Google Apps domain referring 
 * this request.
 *
 * Calling this function will set the default namespace to the
 * Google Apps domain that was used to create the url used for 
 * this request and only for the current request and only if the 
 * current default namespace is unset.
 */
exports.enableRequestNamespace = function () {
    JNamespaceManager.set(JNamespaceManager.getGoogleAppsNamespace());
}

/**
 * Raises an exception if value is not a valid Namespace string.
 * A namespace must match the regular expression 
 * ([0-9A-Za-z._-]{0,100}).
 * @param {string} value The value to validate.
 * @throws {java.lang.IllegalArgumentException}
 */
exports.validateNamespace = function (value) {
    JNamespaceManager.validateNamespace(value);
}
