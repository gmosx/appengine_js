/**
 * http://code.google.com/appengine/docs/java/datastore/
 * http://code.google.com/appengine/docs/python/datastore/
 */

var JDatastoreServiceFactory = Packages.com.google.appengine.api.datastore.DatastoreServiceFactory;

var JDatastore = exports.Datastore = JDatastoreServiceFactory.getDatastoreService();
var JKey = exports.Key = Packages.com.google.appengine.api.datastore.Key;
exports.KeyFactory = Packages.com.google.appengine.api.datastore.KeyFactory;
var JEntity = exports.Entity = Packages.com.google.appengine.api.datastore.Entity;
exports.Query = Packages.com.google.appengine.api.datastore.Query;

/**
 * Normalizes and type checks the given argument.
 * 
 * Args:
 *   arg: an instance, tuple, list, iterator, or generator of the given type(s)
 *   types: allowed type or tuple of types
 *
 * Returns:
 *   A (list, bool) tuple. The list is a normalized, shallow copy of the
 *   argument. The boolean is true if the argument was a sequence, false
 *   if it was a single object.
 *
 * Raises:
 *   AssertionError: types includes list or tuple.
 *   BadArgumentError: arg is not an instance or sequence of one of the given
 *   types.
 */
exports.normalizeAndTypeCheck = function(arg, types) {
    if (isArray(arg)) {
        return [arg, true];
    } else {
        return [[arg], false];
    }
}

exports.normalizeAndTypeCheckKeys = function(arg, types) {
    var parts = normalizeAndTypeCheck(keys, ["string", Key, JEntity]),
        keys = parts[0],
        multiple = parts[1];
        
    return [keys.map(function(k) { return getCompleteKeyOrError(k) }), multiple];
}

/**
 */
var getCompleteKeyOrError = exports.getCompleteKeyOrError = function(arg) {
    var key;
    
    if (arg.constructor == Key) {
        key = arg;
    } else if (typeof(arg) == "string") {
        key = new Key(arg);
    } // check JEntity
/*    
    if (!key.hasKeyOrId()) {
        throw BadKeyError("Key " + key + " is not complete");   
    }
*/    
    return key;
}
