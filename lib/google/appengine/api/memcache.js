var MemcacheService = exports.Memcache = Packages.com.google.appengine.api.memcache.MemcacheServiceFactory.getMemcacheService(),
    Expiration = Packages.com.google.appengine.api.memcache.Expiration,
    SetPolicy = Packages.com.google.appengine.api.memcache.MemcacheService.SetPolicy,
    SET_ALWAYS = SetPolicy.SET_ALWAYS;
    ADD_ONLY_IF_NOT_PRESENT = SetPolicy.ADD_ONLY_IF_NOT_PRESENT;
    
var JArrayList = java.util.ArrayList,
    JMap = java.util.HashMap;

/**
 * Sets a key's value, regardless of previous contents in cache.
 */
exports.set = function(key, value, time, minCompressLen, namespace) {
    var expiration = time ? Expirations.byDeltaSeconds(time) : null;
    MemcacheService.put(key, value, expiration, SET_ALWAYS);
}

/**
 * Set multiple keys' values at once. Reduces the network latency of doing many 
 * requests in serial.
 */
exports.setMulti = exports.setAll = function(mapping, time, keyPrefix, minCompressLen, namespace) {
    var expiration = time ? Expirations.byDeltaSeconds(time) : null;
    var values = new JMap();
    for (var key in mapping) values.put(key, mapping[key]);
    MemcacheService.putAll(values, time, SET_ALWAYS);
}

/**
 * Sets a key's value, if and only if the item is not already in memcache.
 */
exports.add = function(key, value, time, minCompressLen, namespace) {
    var expiration = time ? Expirations.byDeltaSeconds(time) : null;
    MemcacheService.put(key, value, expiration, ADD_ONLY_IF_NOT_PRESENT);
}

/**
 * Adds multiple keys' values at once. Reduces the network latency of doing many 
 * requests in serial.
 */
exports.addMulti = exports.addAll = function(mapping, time, keyPrefix, minCompressLen, namespace) {
    var expiration = time ? Expirations.byDeltaSeconds(time) : null;
    var values = new JMap();
    for (var key in mapping) values.put(key, mapping[key]);
    MemcacheService.putAll(values, time, ADD_ONLY_IF_NOT_PRESENT);
}

exports.get = function(key, namespace) {
    return MemcacheService.get(key);
}

/**
 * Looks up multiple keys from memcache in one operation. This is the recommended 
 * way to do bulk loads.
 * The returned value is a dictionary of the keys and values that were present 
 * in memcache. Even if the key_prefix was specified, that key_prefix won't be 
 * on the keys in the returned dictionary.
 */
exports.getMulti = exports.getAll = function(keys, keyPrefix, namespace) {
    var list = new JArrayList(keys.length);
    for (var i = 0; i < keys.length; i++) list.add(keys[i]);
    var objs = MemcacheService.getAll(list);

    var dict = {};
	for (var obj in Iterator(objs.entrySet()))
	    dict[obj.getKey()] = obj.getValue();
    
    return dict;
}

/**
 * Deletes a key from memcache.
 */
exports.remove = exports.DELETE = function(key, seconds, namespace) {
    return MemcacheService["delete"](key, seconds * 1000);
}

/**
 * Deletes a key from memcache.
 */
exports.removeAll = exports.DELETEALL = function(keys, seconds, namespace) {
    var list = new JArrayList(keys.length);
    for (var i = 0; i < keys.length; i++) list.add(keys[i]);
    return MemcacheService["delete"](list, seconds * 1000);
}

exports.flushAll = exports.clearAll = function() {
    MemcacheService.clearAll();
}

// -----------------------------------------------------------------------------

var Client = exports.Client = function() {
}
