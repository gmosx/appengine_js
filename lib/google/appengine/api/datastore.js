/**
 * http://code.google.com/appengine/docs/java/datastore/
 * http://code.google.com/appengine/docs/python/datastore/
 */

var JDatastoreServiceFactory = Packages.com.google.appengine.api.datastore.DatastoreServiceFactory;

exports.Datastore = JDatastoreServiceFactory.getDatastoreService();
exports.Key = Packages.com.google.appengine.api.datastore.Key;
exports.KeyFactory = Packages.com.google.appengine.api.datastore.KeyFactory;
exports.Entity = Packages.com.google.appengine.api.datastore.Entity;
exports.Query = Packages.com.google.appengine.api.datastore.Query;
