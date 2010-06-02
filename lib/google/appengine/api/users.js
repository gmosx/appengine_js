/**
 * http://code.google.com/appengine/docs/java/users/
 * http://code.google.com/appengine/docs/python/users/
 */

var JUserServiceFactory = Packages.com.google.appengine.api.users.UserServiceFactory,
    jservice = exports.UserService = JUserServiceFactory.getUserService();

var defineError = require("google/appengine/utils").defineError;
exports.UserNotFoundError = defineError("UserNotFoundError");
exports.RedirectTooLongError = defineError("RedirectTooLongError");

/**
 * Represents a user with a Google account.
 */
var User = exports.User = function (email) {
    if (email) {
        this.email = email;
    } else {
        var user = jservice.getCurrentUser();
        
        if (user) {
            this.email = user.getEmail();
            this.nickname = user.getNickname();
            this.userId = user.getUserId();
        } else {
            throw new exports.UserNotFoundError();
        }
    }    
}

// Create a user object from a Java object.
User.fromJavaUser = function (juser) {
    var user = new User();
    user.email = juser.getEmail();
    user.nickname = juser.getNickname();
    user.userId = juser.getUserId();
    return user;
} 
 
/**
 * Returns a URL that, when visited, will prompt the user to sign in using a 
 * Google account, then redirect the user back to the URL given as dest_url. 
 * This URL is suitable for links, buttons and redirects.
 */
exports.createLoginURL = function (dest) {
    return jservice.createLoginURL(dest);
}

/**
 *
 */
exports.createLogoutURL = function (dest) {
    return jservice.createLogoutURL(dest);
}

/**
 * Returns the User object for the current user (the user who made the request 
 * being processed) if the user is signed in, or None if the user is not 
 * signed in.
 */
exports.getCurrentUser = function () {
    var currentUser =  jservice.getCurrentUser();
    
    if (currentUser) {
        var user = new User(currentUser.getEmail());
        user.nickname = currentUser.getNickname();
        user.userId = currentUser.getUserId();
        
        return user;
    } else {
        return null;
    }
}

/**
 * Returns True if the current user is signed in and is currently registered as 
 * an administrator of this application.
 */
exports.isCurrentUserAdmin = function () {
    return jservice.isUserAdmin();
}
