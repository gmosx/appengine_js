/**
 * @fileOverview OAuth API.
 * A service that enables App Engine apps to validate OAuth requests.
 */

var JOAUTH = Packages.com.google.appengine.api.oauth,
    JOAuthServiceFactory = JOAUTH.OAuthServiceFactory;  

var User = require("google/appengine/api/users").User;

/** Base error type for invalid OAuth requests. */
exports.OAuthRequestError = JOAUTH.OAuthRequestException;

/** Thrown if there was a problem communicating with the OAuth service. */
exports.OAuthServiceFailureError = JOAUTH.OAuthServiceFailureException;

/**
 * Returns the User on whose behalf the request was made.
 *
 * @return {User} The current user.
 * @throws {OAuthRequestError} The request was not a valid OAuth request.
 * @throws {OAuthServiceFailureError} An unknown error occurred.
 */
exports.getCurrentUser = function () {
    return User.fromJavaUser(OAuthServiceFactory.getOAuthService().getCurrentUser());
}

/**
 * Returns true if the User on whose behalf the request was made is an admin.
 *
 * @return {boolean} Is the user admin?
 * @throws {OAuthRequestError} The request was not a valid OAuth request.
 * @throws {OAuthServiceFailureError} An unknown error occurred.
 */
exports.isCurrentUserAdmin = function () {
    return OAuthServiceFactory.getOAuthService().isUserAdmin();
}

/**
 * Returns the value of the 'oauth_consumer_key' parameter from the request.
 *
 * @returns {string} The value of the 'oauth_consumer_key' parameter from the request, 
 *                   an identifier for the consumer that signed the request.
 * @throws {OAuthRequestError} The request was not a valid OAuth request.
 * @throws {OAuthServiceFailureError} An unknown error occurred.
 */
exports.getOAuthConsumerKey = function () {
    return OAuthServiceFactory.getOAuthService().getOAuthConsumerKey();
}
