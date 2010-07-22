var jmemcache = Packages.com.google.appengine.api.memcache,
    jservice = jmemcache.MemcacheServiceFactory.getMemcacheService(),
    Expiration = jmemcache.Expiration,
    JSetPolicy = jmemcache.MemcacheService.SetPolicy,
    SET_ALWAYS = JSetPolicy.SET_ALWAYS,
    ADD_ONLY_IF_NOT_PRESENT = JSetPolicy.ADD_ONLY_IF_NOT_PRESENT;
    
var JArrayList = java.util.ArrayList,
    JMap = java.util.HashMap;

/**
 * Sets a key's value, regardless of previous contents in cache.
 */
exports.set = function(key, value, time, minCompressLen, namespace) {
    var expiration = time ? Expiration.byDeltaSeconds(time) : null;
    jservice.put(key, JSON.stringify(value), expiration, SET_ALWAYS);
}

/**
 * Set multiple keys' values at once. Reduces the network latency of doing many 
 * requests in serial.
 */
exports.setMulti = exports.setAll = function(mapping, time, keyPrefix, minCompressLen, namespace) {
    var expiration = time ? Expiration.byDeltaSeconds(time) : null;
    var values = new JMap();
    for (var key in mapping) values.put(key, JSON.stringify(mapping[key]));
    jservice.putAll(values, time, SET_ALWAYS);
}

exports.get = function(key, namespace) {
    return JSON.parse(String(jservice.get(key)));
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
    var objs = jservice.getAll(list);

    var dict = {};
	for (var obj in Iterator(objs.entrySet()))
	    dict[obj.getKey()] = JSON.parse(String(obj.getValue()));
    
    return dict;
}

/**
 * Deletes a key from memcache.
 */
exports.remove = exports.DELETE = function(key, seconds, namespace) {
    if (seconds != undefined) {
        return jservice["delete"](key, seconds * 1000);
    } else {
        return jservice["delete"](key);
    }
}

/**
 * Deletes a key from memcache.
 */
exports.removeAll = exports.DELETEALL = function(keys, seconds, namespace) {
    var list = new JArrayList(keys.length);
    for (var i = 0; i < keys.length; i++) list.add(keys[i]);
    return jservice["delete"](list, seconds * 1000);
}

/**
 * Sets a key's value, if and only if the item is not already in memcache.
 */
exports.add = function(key, value, time, minCompressLen, namespace) {
    var expiration = time ? Expiration.byDeltaSeconds(time) : null;
    jservice.put(key, JSON.stringify(value), expiration, ADD_ONLY_IF_NOT_PRESENT);
}

/**
 * Adds multiple keys' values at once. Reduces the network latency of doing many 
 * requests in serial.
 */
exports.addMulti = exports.addAll = function(mapping, time, keyPrefix, minCompressLen, namespace) {
    var expiration = time ? Expiration.byDeltaSeconds(time) : null;
    var values = new JMap();
    for (var key in mapping) values.put(key, JSON.stringify(mapping[key]));
    jservice.putAll(values, time, ADD_ONLY_IF_NOT_PRESENT);
}

/**
 * Atomically increments a key's value. Internally, the value is a unsigned 
 * 64-bit integer. Memcache doesn't check 64-bit overflows. The value, if too 
 * large, will wrap around.
 * If the key does not yet exist in the cache and you specify an initialValue, 
 * the key's value will be set to this initial value and then incremented. 
 * If the key does not exist and no initialValue is specified, the key's 
 * value will not be set.
 */
exports.incr = function(key, delta, namespace, initialValue) {
    if (initialValue) {
        jservice.increment(key, delta || 1, initialValue);
    } else {
        jservice.increment(key, delta || 1);
    }
}

/**
 * Atomically decrements a key's value. Internally, the value is a unsigned 
 * 64-bit integer. Memcache doesn't check 64-bit overflows. The value, if too 
 * large, will wrap around.
 * If the key does not yet exist in the cache and you specify an initialValue, 
 * the key's value will be set to this initial value and then decremented. 
 * If the key does not exist and no initialValue is specified, the key's 
 * value will not be set.
 */
exports.decr = function(key, delta, namespace, initialValue) {
    if (initialValue) {
        jservice.increment(key, -(delta || 1), initialValue);
    } else {
        jservice.increment(key, -(delta || 1));
    }
}

/**
 * Increments or decrements multiple keys with integer values in a single 
 * service call. Each key can have a separate offset. The offset can be positive 
 * or negative.
 * Applying an offset to a single key is atomic. Applying an offset to multiple 
 * keys may succeed for some keys and fail for others.
 *
 * mapping
 *  Dictionary of keys to offsets. An offset can be a positive or negative 
 *  integer to be added to the key's value.
 * key_prefix
 *  Prefix for to prepend to all keys.
 */
exports.offsetMulti = function(mapping, key_prefix, namespace, initialValue) {
    var offsets = new JMap();
    for (var key in mapping) offsets.put(key, mapping[key]);
    
    if (initialValue) {
        jservice.incrementAll(offsets, initialValue);
    } else {
        jservice.incrementAll(offsets, -(delta || 1));
    }
}

// TODO: Java incrementAll API (many keys, one delta)
exports.offsetAll = function(keys, delta, namespace, initialValue) {
}

/**
 * Deletes everything in memcache.
 */
exports.flushAll = exports.clearAll = function() {
    jservice.clearAll();
}

/**
 * A client for communicating with the Memcache service.
 * Provides compatibility with the Python Memcached API, not implemented.
 *
 * @constructor
 */
var Client = exports.Client = function() {
    return exports;
}
