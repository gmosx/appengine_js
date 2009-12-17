/**
 * http://code.google.com/appengine/docs/java/blobstore/
 * http://code.google.com/appengine/docs/python/blobstore/
 */

var JBlobstoreServiceFactory = Packages.com.google.appengine.api.blobstore.BlobstoreServiceFactory;   
var jservice = exports.BlobstoreService = JBlobstoreServiceFactory.getBlobstoreService();
var JBlobKey = exports.BlobKey = Packages.com.google.appengine.api.blobstore.BlobKey;
exports.BlobKeyFactory = Packages.com.google.appengine.api.blobstore.BlobKeyFactory;
var JBlobInfo = exports.BlobInfo = Packages.com.google.appengine.api.blobstore.BlobInfo;
exports.BlobInfoFactory = Packages.com.google.appengine.api.blobstore.BlobInfoFactory; 


exports.createUploadUrl = function(dest) {
    return String(jservice.createUploadUrl(dest));
};

exports['delete'] = function(blobKey) {
    jservice['delete'](blobKey.__key__);
};   

exports.getUploadedBlobs  = function(request) {
    return jservice.getUploadedBlobs(request);
};

var BlobKey = exports.BlobKey = function(keyString) {
    this.__key__ = new JBlobKey(keyString);
}