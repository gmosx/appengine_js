/**
 * @fileoverview Higher-level, semantic data types for the datastore. These types
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

var JDatastoreServiceFactory = Packages.com.google.appengine.api.datastore.DatastoreServiceFactory,
    JDatastore = JDatastoreServiceFactory.getDatastoreService(),
    JKey = Packages.com.google.appengine.api.datastore.Key,
    JKeyFactory = Packages.com.google.appengine.api.datastore.KeyFactory,
    JString = Packages.java.lang.String;

/**
 * The primary key for a datastore entity.
 * 
 * A datastore GUID. A Key instance uniquely identifies an entity across all
 * apps, and includes all information necessary to fetch the entity from the
 * datastore with Get().
 *
 * @constructor
 */
var Key = exports.Key = function (encoded) {
    this.__key__ = JKeyFactory.stringToKey(encoded);
}

Key.create = function (options) {
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

Key.fromDatastoreKey = function (dsKey) {
    var key = Object.create(Key.prototype);
    key.__key__ = dsKey;
    return key;
}

/**
 * Construct a Key out of a "path" (kind, id or name, ...).
 *
 * This is useful when an application wants to use just the id or name portion
 * of a key in e.g. a URL, where the rest of the URL provides enough context to
 * fill in the rest, i.e. the app id (always implicit), the entity kind, and
 * possibly an ancestor key. Since ids and names are usually small, they're
 * more attractive for use in end-user-visible URLs than the full string
 * representation of a key.
 *
 * Args:
 *   kind: the entity kind (a str or unicode instance)
 *   id_or_name: the id (an int or long) or name (a str or unicode instance)
 *
 * Additional positional arguments are allowed and should be
 * alternating kind and id/name.
 *
 * Keyword args:
 *   parent: optional parent Key; default None.
 *
 * Returns:
 *   A new Key instance whose .kind() and .id() or .name() methods return
 *   the *last* kind and id or name positional arguments passed.
 *
 * Raises:
 *   BadArgumentError for invalid arguments.
 *   BadKeyError if the parent key is incomplete.
 */
Key.fromPath = function () {
    throw Error("Not implemented");    
}

/**
 * Returns this entity's app id, a string.
 */
Key.prototype.app = function () {
    throw Error("Not implemented");    
}

/**
 * Returns this entity's namespace, a string.
 */
Key.prototype.namespace = function () {
    throw Error("Not implemented");    
}

Key.prototype.appIdNamespace = function () {
    throw Error("Not implemented");    
}

Key.prototype.kind = function () {
    return this.__key__.getKind();
}

Key.prototype.id = function () {
    return this.__key__.getId();
}

Key.prototype.name = function () {
    return this.__key__.getName();
}

Key.prototype.parent = function () {
    return Key.fromDatastoreKey(this.__key__.getParent());
}

Key.prototype.key = function () {
    return this;
}

Key.prototype.datastoreKey = function () {
    return this.__key__;
}

Key.prototype.toString = function () {
    return JKeyFactory.keyToString(this.__key__);
}

Key.prototype.valueOf = function () {
    return JKeyFactory.keyToString(this.__key__);
}

Key.prototype.toJSON = Key.prototype.toString;

/**
 * @constructor
 */
var Category = exports.Category = function (tag) {
}

/**
 * Key used to identify a blob in Blobstore.
 * 
 * This object wraps a string that gets used internally by the Blobstore API
 * to identify application blobs.  The BlobKey corresponds to the entity name
 * of the underlying BlobReference entity.
 *
 * This class is exposed in the API in both google.appengine.ext.db and
 * google.appengine.ext.blobstore.
 *
 * Constructor:
 *
 * Used to convert a string to a BlobKey.  Normally used internally by
 * Blobstore API.
 *
 * Args:
 *   blobKey:  Key name of BlobReference that this key belongs to.
 *
 * @constructor
 */
var BlobKey = exports.BlobKey = function (blobKey) {
    // TODO: ValidateString(blob_key, 'blob-key')
    this.blobKey = blobKey;
}

BlobKey.prototype.toString = function () {
    return this.blobKey;
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
 *
 * @constructor
 */
var Category = exports.Category = function (tag) {
}


/**
 * A fully qualified URL. Usually http: scheme, but may also be file:, ftp:,
 * news:, among others.
 *
 * @constructor
 */
var Link = exports.Link = function (link) {
}
 
/**
 * An RFC2822 email address. Makes no attempt at validation; apart from
 * checking MX records, email address validation is a rathole.
 *
 * This is the gd:email element. In XML output, the email address is provided as
 * the address attribute. See:
 * http://code.google.com/apis/gdata/common-elements.html#gdEmail
 *
 * @constructor
 */
var Email = exports.Email = function () {
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
 *
 * @constructor
 */
 // THINK: use more javascriptish latitude, longitude?
var GeoPt = exports.GeoPt = function (lat, lon) {
    this.lat = lat;
    this.lon = lon;
}

GeoPt.prototype.toXML = function () {
    return "<georss:point>" + this.lat + " " + this.lon + "</georss:point>";
}
