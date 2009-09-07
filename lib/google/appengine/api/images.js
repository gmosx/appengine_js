/**
 * Image manipulation API.
 */ 
var JImagesServiceFactory = Packages.com.google.appengine.api.images.ImagesServiceFactory,
    JImage = Packages.com.google.appengine.api.images.Image,
    jservice = JImagesServiceFactory.getImagesService();
   
var ByteString = require("binary").ByteString;
   
var bytestring = function(bytes) {
    var b = new ByteString();
    b._bytes = bytes;
    b._offset = 0;
    b._length = Number(b._bytes.length);
    
    return b;
}

/**
 * Resizes an image, scaling down or up to the given width and height. The 
 * function takes the image data to resize, and returns the transformed image in 
 * the same format.
 *
 * imageData = ByteString of image data.
 *
 * Returns a ByteString containing the transformed image data. 
 */
exports.resize = function(imageData, width, height, outputEncoding) {
    var oldImage = JImagesServiceFactory.makeImage(imageData._bytes);
    var transform = JImagesServiceFactory.makeResize(width, height);
    var newImage = jservice.applyTransform(transform, oldImage);
    
    return bytestring(newImage.getImageData());
}

/**
 * Crops an image to a given bounding box. The function takes the image data to 
 * crop, and returns the transformed image in the same format.
 * 
 * The left, top, right and bottom of the bounding box are specified as 
 * proportional distances. The coordinates of the bounding box are determined as 
 * left_x * width, top_y * height, right_x * width and bottom_y * height. This 
 * allows you to specify the bounding box independently of the final width and 
 * height of the image, which may change simultaneously with a resize action.
 */
exports.crop = function(imageData, leftX, topY, rightX, bottomY, outputEncoding) {
}

/**
 * Rotates an image. The amount of rotation must be a multiple of 90 degrees. 
 * The function takes the image data to rotate, and returns the transformed 
 * image in the same format.
 * 
 * Rotation is performed clockwise. A 90 degree turn rotates the image so that 
 * the edge that was the top becomes the right edge.
 */
exports.rotate = function(imageData, degrees, outputEncoding) {
}

/**
 */
exports.horizontalFlip = function() {
    throw new Error("not implemented");
}

/**
 */
exports.verticalFlip = function() {
    throw new Error("not implemented");
}

/**
 */
exports.imFeelingLucky = function() {
    throw new Error("not implemented");
}
