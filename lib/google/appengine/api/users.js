/**
 * http://code.google.com/appengine/docs/java/users/
 * http://code.google.com/appengine/docs/python/users/
 */

var JUserServiceFactory = Packages.com.google.appengine.api.users.UserServiceFactory;

/**
 * Access the Java API.
 */
var jservice = exports.UserService = JUserServiceFactory.getUserService();

// A conversion of the Python API.

/**
 *
 */
exports.createLoginURL = function(dest) {
    return jservice.createLoginURL(dest);
}

/**
 *
 */
exports.createLogoutURL = function(dest) {
    return jservice.createLogoutURL(dest);
}

/**
 *
 */
exports.getCurrentUser = function() {
    return jservice.getCurrentUser();
}

/**
 *
 */
exports.isCurrentUserAdmin = function() {
    return jservice.isUserAdmin();
}
