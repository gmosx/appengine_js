/**
 * http://code.google.com/appengine/docs/java/users/
 * http://code.google.com/appengine/docs/python/users/
 */

var UserServiceFactory = Packages.com.google.appengine.api.users.UserServiceFactory;

/**
 * Access the Java API.
 */
var UserService = exports.Users = UserServiceFactory.getUserService();

// A conversion of the Python API.

/**
 *
 */
exports.createLoginURL = function(dest) {
    return UserService.createLoginURL(dest);
}

/**
 *
 */
exports.createLogoutURL = function(dest) {
    return UserService.createLogoutURL(dest);
}

/**
 *
 */
exports.getCurrentUser = function() {
    return UserService.getCurrentUser();
}

/**
 *
 */
exports.isCurrentUserAdmin = function() {
    return UserService.isUserAdmin();
}


