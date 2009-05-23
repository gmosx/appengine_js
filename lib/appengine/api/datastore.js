/**
 * http://code.google.com/appengine/docs/java/datastore/
 * http://code.google.com/appengine/docs/python/datastore/
 */

var JDatastoreServiceFactory = Packages.com.google.appengine.api.datastore.DatastoreServiceFactory,
    JKeyFactory = Packages.com.google.appengine.api.datastore.KeyFactory,
    JEntity = Packages.com.google.appengine.api.datastore.Entity,
    JQuery = Packages.com.google.appengine.api.datastore.Query;

exports.Entity = JEntity;
exports.Query = JQuery;
exports.KeyFactory = JKeyFactory;
exports.Store = JDatastoreServiceFactory.getDatastoreService();
