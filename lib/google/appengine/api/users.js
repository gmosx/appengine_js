/**
 * http://code.google.com/appengine/docs/java/users/
 * http://code.google.com/appengine/docs/python/users/
 */

var JUserServiceFactory = Packages.com.google.appengine.api.users.UserServiceFactory,
    jservice = exports.UserService = JUserServiceFactory.getUserService();

var UserNotFoundError = function(message) {
    this.message = message;
}

UserNotFoundError.prototype = Object.create(Error.prototype);

/**
 * Represents a user with a Google account.
 */
var User = exports.User = function(email) {
    if (email) {
        this.email = email;
    } else {
        var user = jservice.getCurrentUser();
        
        if (user) {
            this.email = String(user.getEmail());
            this.nickname = String(user.getNickname());
            this.userId = String(user.getUserId());
        } else {
            throw new UserNotFoundError();
        }
    }    
}

/**
 * Returns a URL that, when visited, will prompt the user to sign in using a 
 * Google account, then redirect the user back to the URL given as dest_url. 
 * This URL is suitable for links, buttons and redirects.
 */
exports.createLoginURL = function(dest) {
    return String(jservice.createLoginURL(dest));
}

/**
 *
 */
exports.createLogoutURL = function(dest) {
    return String(jservice.createLogoutURL(dest));
}

/**
 * Returns the User object for the current user (the user who made the request 
 * being processed) if the user is signed in, or None if the user is not 
 * signed in.
 */
exports.getCurrentUser = function() {
    var currentUser =  jservice.getCurrentUser();
    
    if (currentUser) {
        var user = new User(String(currentUser.getEmail()));
        user.nickname = String(currentUser.getNickname());
        user.userId = String(currentUser.getUserId());
        
        return user;
    } else {
        return null;
    }
}

/**
 * Returns True if the current user is signed in and is currently registered as 
 * an administrator of this application.
 */
exports.isCurrentUserAdmin = function() {
    return jservice.isUserAdmin();
}
