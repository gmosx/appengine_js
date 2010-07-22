/**
 * @fileoverview Users API.
 *
 * http://code.google.com/appengine/docs/java/users/
 * http://code.google.com/appengine/docs/python/users/
 */

// WARNING: federated identity not implemented yet!

var JUserServiceFactory = Packages.com.google.appengine.api.users.UserServiceFactory,
    JUser = Packages.com.google.appengine.api.users.User,
    jservice = exports.UserService = JUserServiceFactory.getUserService();

var defineError = require("google/appengine/utils").defineError;
exports.UserNotFoundError = defineError("UserNotFoundError");
exports.RedirectTooLongError = defineError("RedirectTooLongError");

/** 
 * A user.
 *
 * We provide the email address, nickname, auth domain, and id for a user.
 *
 * A nickname is a human-readable string which uniquely identifies a Google
 * user, akin to a username. It will be an email address for some users, but
 * not all.
 *
 * A user could be a Google Accounts user or a federated login user.
 *
 * federatedIdentity and federatedProvider are only avaliable for
 * federated users.
 *
 * @constructor
 * @param {string=} email An optional string of the user's email address. It defaults to the current user's email address.
 * @param {string=} federatedIdentity Federated identity of user. It defaults to the current user's federated identity.
 * @param {string=} federatedProvider Federated provider url of user.
 * @return {User} The user.
 */
var User = exports.User = function (email, federatedIdentity, federatedProvider) {
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
 
User.prototype.toJavaUser = function () {
    return new JUser(this.email, this.authDomain, this.userId);
} 
 
/**
 * Returns a URL that, when visited, will prompt the user to sign in using a 
 * Google account, then redirect the user back to the URL given as dest_url. 
 * This URL is suitable for links, buttons and redirects.
 *
 * @param {string} destURL String that is the desired final destination URL for the user
 *                 once login is complete. If 'destURL' does not have a host
 *                 specified, we will use the host from the current request.
 * @param {string} _authDomain Ignored.
 * @param {string} federated_identity FederatedIdentity is used to trigger OpenId Login
 *                 flow, an empty value will trigger Google OpenID Login by default.
 * @return {string} Login URL as a string. If federated_identity is set, this 
 *                  will be a federated login using the specified identity. If not, this will use Google Accounts.
 */
exports.createLoginURL = function (destURL, _authDomain, federatedIdentity) {
    // TODO: support federated login.
    return jservice.createLoginURL(destURL);
}

/**
 * Computes the logout URL for this request and specified destination URL, for 
 * both federated login App and Google Accounts App.
 *
 * @param {string} String that is the desired final destination URL for the user
 *                 once logout is complete. If 'destURL' does not have a host
 *                 specified, we will use the host from the current request.
 * @return {string} Logout URL as a string.
 */
exports.createLogoutURL = function (destURL) {
    return jservice.createLogoutURL(destURL);
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
 * Return true if the user making this request is an admin for this
 * application, false otherwise.
 *
 * We specifically make this a separate function, and not a member function of
 * the User class, because admin status is not persisted in the datastore. It
 * only exists for the user making this request right now.
 *
 * @return {boolean} True if the user is admin.
 */
exports.isCurrentUserAdmin = function () {
    return jservice.isUserAdmin();
}
