var db = require("google/appengine/ext/db"),
    Query = db.Query,
    Property = db.Property,
    utils = require("google/appengine/utils");

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
 */
var BlobInfo = exports.BlobInfo = function() {};

BlobInfo.get = function(blobKeys) {
}

/**
 * Get query for all Blobs associated with application.
 *
 * Returns:
 *   A db.Query object querying over BlobInfo's datastore kind.
 */
BlobInfo.all = function() {
	return new Query(this);
}

/**
 * Get a BlobInfo record from blobstore.
 * 
 * Does the same as BlobInfo.get.
 */
exports.get = function(blobKey) {
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
 *   Picture.all().filter("title =", "").fetch().forEach(function(picture) {
 *       list.push(picture.image.key());
 *   }
 */
var BlobReferenceProperty = exports.BlobReferenceProperty = function(options) {
    Property.call(this, options);
    this.indexed = false;
}

utils.extend(BlobReferenceProperty, Property);

BlobReferenceProperty.prototype.init = function(constructor) {
}

BlobReferenceProperty.prototype.getValueForDatastore = function(obj) {
}

BlobReferenceProperty.prototype.makeValueFromDatastore = function(value) {
}
