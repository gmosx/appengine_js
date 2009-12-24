/**
 * A JavaScript blobstore API used by app developers.
 *
 * Contains methods uses to interface with Blobstore API.  Defines db.Key-like
 * class representing a blob-key.  Contains API part that forward to apiproxy.
 *  
 * http://code.google.com/appengine/docs/java/blobstore/
 * http://code.google.com/appengine/docs/python/blobstore/
 */

var JBlobstoreServiceFactory = Packages.com.google.appengine.api.blobstore.BlobstoreServiceFactory,
    jservice = JBlobstoreServiceFactory.getBlobstoreService(),
    JBlobKey = Packages.com.google.appengine.api.blobstore.BlobKey,
    JArrayList = java.util.ArrayList;

var DATASTORE_TYPES = require("google/appengine/api/datastore/types");
    BlobKey = DATASTORE_TYPES.BlobKey;

exports.BLOB_INFO_KIND = "__BlobInfo__";
exports.BLOB_KEY_HEADER = "X-AppEngine-BlobKey";
exports.UPLOAD_INFO_CREATION_HEADER = "X-AppEngine-Upload-Creation";

exports.createUploadUrl = function(successPath) {
    return String(jservice.createUploadUrl(successPath));
};

/**
 * Delete a blob from Blobstore.
 *
 * Args:
 *   blobKeys: Single instance or list of blob keys.  A blob-key can be either
 *   a string or an instance of BlobKey.
 */
exports.remove = exports.DELETE = function(blobKeys) {
    if (isArray(blobKeys)) {
        if (keys.length > 0) {
            var list = new JArrayList(blobKeys.length);
            for (var i = 0; i < blobKeys.length; i++) list.add(new JBlobKey(blobKeys[i].toString()));
            jservice["delete"](list);
        }
    } else {
        jservice["delete"](new JBlobKey(blobKeys.toString()));
    }
};


//------------------------------------------------------------------------------
// Extension of the Python API, converted from the Java API.

/**
 */
exports.getUploadedBlobs  = function(env) {
    var map = jservice.getUploadedBlobs(env["jack.servlet_request"]),
        blobKeys = {};
        
    for (var i in Iterator(map.entrySet())){
        var blobKey = new BlobKey(i.getValue());
        blobKeys[String(i.getKey())] = new BlobKey(String(i.getValue().getKeyString()));
    }  

    return blobKeys;
};

/**
 */
exports.serve = function(blobKey, env) { 
    jservice.serve(new JBlobKey(blobKey.toString()), env["jack.servlet_response"]); 
    
    return {
        headers: {
            "X-Jack-Send-Java-Response": "true"
        }
    }
};
