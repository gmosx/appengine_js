/**
 * http://code.google.com/appengine/docs/java/datastore/
 * http://code.google.com/appengine/docs/python/datastore/
 */

var DatastoreServiceFactory = Packages.com.google.appengine.api.datastore.DatastoreServiceFactory;

exports.Datastore = DatastoreServiceFactory.getDatastoreService();
exports.KeyFactory = Packages.com.google.appengine.api.datastore.KeyFactory;
exports.Entity = Packages.com.google.appengine.api.datastore.Entity;
exports.Query = Packages.com.google.appengine.api.datastore.Query;
