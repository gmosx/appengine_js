/**
 * http://code.google.com/appengine/docs/java/users/
 * http://code.google.com/appengine/docs/python/users/
 */

var UserServiceFactory = Packages.com.google.appengine.api.users.UserServiceFactory;

exports.Users = UserServiceFactory.getUserService();
