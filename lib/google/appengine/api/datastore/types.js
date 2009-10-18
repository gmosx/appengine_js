var JDatastoreServiceFactory = Packages.com.google.appengine.api.datastore.DatastoreServiceFactory,
    JDatastore = JDatastoreServiceFactory.getDatastoreService(),
    JKey = Packages.com.google.appengine.api.datastore.Key,
    JKeyFactory = Packages.com.google.appengine.api.datastore.KeyFactory,
    JString = Packages.java.lang.String;

/**
 * Higher-level, semantic data types for the datastore. These types
 * are expected to be set as attributes of Entities.  See "Supported Data Types"
 * in the API Guide.
 * 
 * Most of these types are based on XML elements from Atom and GData elements
 * from the atom and gd namespaces. For more information, see:
 * 
 * http://www.atomenabled.org/developers/syndication/
 * http://code.google.com/apis/gdata/common-elements.html
 *
 * The namespace schemas are:
 * 
 * http://www.w3.org/2005/Atom
 * http://schemas.google.com/g/2005
 */

/**
 * The primary key for a datastore entity.
 * 
 * A datastore GUID. A Key instance uniquely identifies an entity across all
 * apps, and includes all information necessary to fetch the entity from the
 * datastore with Get().
 */
var Key = exports.Key = function(encoded) {
    this.__key__ = JKeyFactory.stringToKey(encoded);
}

Key.create = function(options) {
    var dsKey;
    
    if (options.name) {
        if (options.parent) {
            dsKey = JKeyFactory.createKey(options.parent.datastoreKey(), options.kind, options.name);
        } else {
            dsKey = JKeyFactory.createKey(options.kind, options.name);
        }
    } else {
        if (options.parent) {
            dsKey = JDatastore.allocateIds(options.parent.datastoreKey(), options.kind, 1).getStart();
        } else {
            dsKey = JDatastore.allocateIds(options.kind, 1).getStart();
        }
    }

    return Key.fromDatastoreKey(dsKey);
}

Key.fromDatastoreKey = function(dsKey) {
    var key = Object.create(Key.prototype);
    key.__key__ = dsKey;
    return key;
}

Key.fromPath = function(path) {
}

Key.prototype.kind = function() {
    return String(this.__key__.getKind());
}

Key.prototype.id = function() {
    return String(this.__key__.getId());
}

Key.prototype.name = function() {
    return String(this.__key__.getName());
}

Key.prototype.parent = function() {
    return Key.fromDatastoreKey(this.__key__.getParent());
}

Key.prototype.key = function() {
    return this;
}

Key.prototype.datastoreKey = function() {
    return this.__key__;
}

Key.prototype.toString = function() {
    return String(JKeyFactory.keyToString(this.__key__));
}

/**
 * A tag, ie a descriptive word or phrase. Entities may be tagged by users,
 * and later returned by a queries for that tag. Tags can also be used for
 * ranking results (frequency), photo captions, clustering, activity, etc.
 *
 * Here's a more in-depth description:  http://www.zeldman.com/daily/0405d.shtml
 *
 * This is the Atom "category" element. In XML output, the tag is provided as
 * the term attribute. See:
 * http://www.atomenabled.org/developers/syndication/#category
 *
 * Raises BadValueError if tag is not a string or subtype.
 */
var Category = exports.Category = function(tag) {
}

/**
 * An RFC2822 email address. Makes no attempt at validation; apart from
 * checking MX records, email address validation is a rathole.
 *
 * This is the gd:email element. In XML output, the email address is provided as
 * the address attribute. See:
 * http://code.google.com/apis/gdata/common-elements.html#gdEmail
 */
var Email = exports.Email = function() {
}

/**
 * A geographical point, specified by floating-point latitude and longitude
 * coordinates. Often used to integrate with mapping sites like Google Maps.
 * May also be used as ICBM coordinates.
 * 
 * This is the georss:point element. In XML output, the coordinates are
 * provided as the lat and lon attributes. See: http://georss.org/
 * 
 * Serializes to '<lat>,<lon>'. Raises BadValueError if it's passed an invalid
 * serialized string, or if lat and lon are not valid floating points in the
 * ranges [-90, 90] and [-180, 180], respectively.
 */
 // THINK: use more javascriptish latitude, longitude?
var GeoPt = exports.GeoPt = function(lat, lon) {
    this.lat = lat;
    this.lon = lon;
}

GeoPt.prototype.toXML = function() {
    return "<georss:point>" + this.lat + " " + this.lon + "</georss:point>";
}
