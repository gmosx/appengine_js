var db = require("google/appengine/ext/db"),
    Query = db.Query,
    Property = db.Property,
    blobstore = require("google/appengine/api/blobstore"),
    utils = require("google/appengine/utils");

var BLOB_INFO_KIND = blobstore.BLOB_INFO_KIND,
    BLOB_KEY_HEADER = blobstore.BLOB_KEY_HEADER;

/**
 * Information about blobs in Blobstore.
 *
 * This is a db.Model-like class that contains information about blobs stored
 * by an application.  Like db.Model, this class is backed by an Datastore
 * entity, however, BlobInfo instances are read-only and have a much more
 * limited interface.
 *
 * Each BlobInfo has a key of type BlobKey associated with it. This key is
 * specific to the Blobstore API and is not compatible with db.get.  The key
 * can be used for quick lookup by passing it to BlobInfo.get.  This
 * key converts easily to a string, which is web safe and can be embedded
 * in URLs.
 *
 * Properties:
 *   contentType: Content type of blob.
 *   creation: Creation date of blob, when it was uploaded.
 *   filename: Filename user selected from their machine.
 *   size: Size of uncompressed blob.
 *
 * All properties are read-only.  Attempting to assign a value to a property
 * will raise NotImplementedError.
 * 
 * @constructor
 */
var BlobInfo = exports.BlobInfo = function (entity_or_blobKey) {
};

BlobInfo.fromEntity = function (entity) {
    return new BlobInfo(entity);
}

BlobInfo.properties = function () {
    return ["contentType", "creation", "filename", "size"];
}

BlobInfo.kind = function () {
    return BLOB_INFO_KIND;
}

/**
 */
BlobInfo.get = function (blobKeys) {
    if (!blobKeys) return;
    
	return db.get(blobKeys);

    if (!objs) return null;
    
	var kind = this.kind();
	var arr = Array.isArray(objs) ? objs : [objs];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].constructor.kind() != kind) 
			throw new KindError("Instance is of kind '" + arr[i].constructor.kind() + "', expected kind is '" + kind + "'");
	}
	
	return objs;
}

/**
 * Get query for all Blobs associated with application.
 *
 * Returns:
 *   A db.Query object querying over BlobInfo's datastore kind.
 */
BlobInfo.all = function () {
	return new Query(this);
}

/**
 */
BlobInfo.prototype.key = function () {
    return this.__key__;
}

/**
 */
BlobInfo.prototype.remove = BlobInfo.prototype.DELETE = function () {
    blobstore.remove(this.key());
} 
 
BlobInfo.prototype.toString = function () {
    return this.__key__;
}

/**
 * Get a BlobInfo record from blobstore.
 * 
 * Does the same as BlobInfo.get.
 */
exports.get = function (blobKey) {
  return BlobInfo.get(blobKey);
}


/**
 * Add references to blobs to domain models using BlobReferenceProperty:
 *
 *   var Picture = db.Model({
 *     title: new db.StringProperty(),
 *     image: new blobstore.BlobReferenceProperty(),
 *     thumbnail: new blobstore.BlobReferenceProperty()
 *   }
 *
 * To find the size of a picture using this model:
 *
 *   var picture = Picture.get(picture_key)
 *   print(picture.image.size);
 *
 * BlobInfo objects are lazily loaded so iterating over models with
 * for BlobKeys is efficient, the following does not need to hit
 * Datastore for each image key:
 *
 *   var list = [];
 *   Picture.all().filter("title =", "").fetch().forEach(function (picture) {
 *       list.push(picture.image.key());
 *   }
 *
 * @constructor
 */
var BlobReferenceProperty = exports.BlobReferenceProperty = function (options) {
    Property.call(this, options);
    // THINK: this.indexed = false; 
}

utils.extend(BlobReferenceProperty, Property);

BlobReferenceProperty.prototype.init = function (constructor) {
}

BlobReferenceProperty.prototype.getValueForDatastore = function (obj) {
    var blobInfo = obj[this.name];
    return blobInfo ? blobInfo.toString() : null;
}

BlobReferenceProperty.prototype.makeValueFromDatastore = function (value) {
    return value ? new BlobInfo(value) : null;
}

var super_validate = Property.prototype.validate;
BlobReferenceProperty.prototype.validate = function (value) {
    if ((typeof(value) == "string") || (value.constructor == BlobKey)) {
        value = new BlobInfo(value)
    }
    
    return super_validate.call(this, value);
}


/**
 * Provides a read-only file-like interface to a blobstore blob.
 * UNDER CONSTRUCTION
 *
 * @constructor
 */
var BlobReader = exports.BlobReader = function () {
}

/**
 */
BlobReader.prototype.read = function (size) {
}

/**
 */
BlobReader.prototype.readline = function (size) {
}

/**
 */
BlobReader.prototype.readlines = function (size) {
}

/**
 */
BlobReader.prototype.seek = function (offset, whence) {
}

/**
 */
BlobReader.prototype.tell = function () {
}
