/**
 * @fileoverview Datastore API
 * http://code.google.com/appengine/docs/java/datastore/
 * http://code.google.com/appengine/docs/python/datastore/
 */

var JDATASTORE = Packages.com.google.appengine.api.datastore,
    JDatastoreServiceFactory = JDATASTORE.DatastoreServiceFactory,
    JDatastore = exports.Datastore = JDatastoreServiceFactory.getDatastoreService();

var JKey = exports.Key = JDATASTORE.Key;
exports.KeyFactory = JDATASTORE.KeyFactory;

var JEntity = exports.Entity = JDATASTORE.Entity;
exports.Query = JDATASTORE.Query;

var JDatastoreServiceConfigBuilder = JDATASTORE.DatastoreServiceConfig.Builder,
    JReadPolicy = JDATASTORE.ReadPolicy;
    
/** @const */ exports.STRONG_CONSISTENCY = new JReadPolicy(JReadPolicy.Consistency.STRONG);
/** @const */ exports.EVENTUAL_CONSISTENCY = new JReadPolicy(JReadPolicy.Consistency.EVENTUAL);

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
exports.normalizeAndTypeCheck = function (arg, types) {
    if (isArray(arg)) {
        return [arg, true];
    } else {
        return [[arg], false];
    }
}

exports.normalizeAndTypeCheckKeys = function (arg, types) {
    var parts = normalizeAndTypeCheck(keys, ["string", Key, JEntity]),
        keys = parts[0],
        multiple = parts[1];
        
    return [keys.map(function (k) { return getCompleteKeyOrError(k) }), multiple];
}

var getCompleteKeyOrError = exports.getCompleteKeyOrError = function (arg) {
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

/**
 * Specialized RPC for the datastore.
 *
 * Wraps the default RPC class and sets appropriate values for use by the
 * datastore.
 *
 * This class or a sublcass of it is intended to be instatiated by
 * developers interested in setting specific request parameters, such as
 * deadline, on API calls. It will be used to make the actual call.
 *
 * @constructor
 */
var DatastoreRPC = exports.DatastoreRPC = function (args) {
    this.args = args;
}

DatastoreRPC.prototype.getDatastore = function () {
    if (this.args) {
        var config = JDatastoreServiceConfigBuilder.withReadPolicy(this.args.readPolicy || exports.STRONG_CONSISTENCY);
        if (this.args.deadline) {
            config.deadline(this.args.deadline);
        }        
        return JDatastoreServiceFactory.getDatastoreService(config);
    } else {
        return JDatastoreServiceFactory.getDatastoreService();
    }   
}
