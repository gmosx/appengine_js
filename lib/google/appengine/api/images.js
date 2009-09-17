/**
 * Image manipulation API.
 */ 
var JImagesServiceFactory = Packages.com.google.appengine.api.images.ImagesServiceFactory,
    JImagesService = Packages.com.google.appengine.api.images.ImagesService,
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

var PNG = exports.PNG = JImagesService.OutputEncoding.PNG;
var JPEG = exports.JPEG = JImagesService.OutputEncoding.JPEG;

/**
 * An instance of the Image class represents a single image to which multiple 
 * transformations can be applied. Methods on the instance set up 
 * transformations, which are executed all at once when the executeTransforms() 
 * method is called.
 */
var Image = exports.Image = function(imageData) {
    this.image = JImagesServiceFactory.makeImage(imageData._bytes);
    this.transform = JImagesServiceFactory.makeCompositeTransform();
    this.width = Number(this.image.getWidth());
    this.height = Number(this.image.getHeight());
}

/**
 * Resizes an image, scaling down or up to the given width and height.
 */
Image.prototype.resize = function(width, height) {
    this.transform.concatenate(JImagesServiceFactory.makeResize(width || 0, height || 0));
    return this;
}

/**
 * Crops an image to a given bounding box. The method returns the transformed 
 * image in the same format. The left, top, right and bottom of the bounding box 
 * are specified as proportional distances. The coordinates of the bounding box 
 * are determined as left_x * width, top_y * height, right_x * width and 
 * bottom_y * height. This allows you to specify the bounding box independently 
 * of the final width and height of the image, which may change simultaneously 
 * with a resize action.
 */
Image.prototype.crop = function(leftX, topY, rightX, bottomY) {
    this.transform.concatenate(JImagesServiceFactory.makeCrop(leftX, topY, rightX, bottomY));
    return this;
}

/**
 * Rotates an image. The amount of rotation must be a multiple of 90 degrees.
 * Rotation is performed clockwise. A 90 degree turn rotates the image so that 
 * the edge that was the top becomes the right edge.
 */
Image.prototype.rotate = function(degrees) {
    this.transform.concatenate(JImagesServiceFactory.makeRotate(degrees));
    return this;
}

/**
 * Flips an image horizontally. The edge that was the left becomes the right 
 * edge, and vice versa.
 */
Image.prototype.horizontalFlip = function() {
    this.transform.concatenate(JImagesServiceFactory.makeHorizontalFlip());
    return this;
}

/**
 * Flips an image vertically. The edge that was the top becomes the bottom edge, 
 * and vice versa.
 */
Image.prototype.verticalFlip = function() {
    this.transform.concatenate(JImagesServiceFactory.makeVerticalFlip());
    return this;
}

/**
 * Executes all transforms set for the Image instance by the above methods, and 
 * returns the result.
 */
Image.prototype.executeTransforms = function(outputEncoding) {
    if (!outputEncoding) outputEncoding = PNG;
    var newImage = jservice.applyTransform(this.transform, this.image, outputEncoding);

    return bytestring(newImage.getImageData());    
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
    var image = new Image(imageData)
    image.resize(width, height);
    return image.executeTransforms(outputEncoding);
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
    var image = new Image(imageData)
    image.crop(leftX, topY, rightX, bottomY);
    return image.executeTransforms(outputEncoding);
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
    var image = new Image(imageData)
    image.rotate(degrees);
    return image.executeTransforms(outputEncoding);
}

/**
 * Flips an image horizontally. The edge that was the left becomes the right 
 * edge, and vice versa.
 */
exports.horizontalFlip = function() {
    var image = new Image(imageData)
    image.horizontalFlip();
    return image.executeTransforms(outputEncoding);
}

/**
 * Flips an image vertically. The edge that was the top becomes the bottom edge, 
 * and vice versa.
 */
exports.verticalFlip = function() {
    var image = new Image(imageData)
    image.verticalFlip();
    return image.executeTransforms(outputEncoding);
}

/**
 */
exports.imFeelingLucky = function() {
    throw new Error("not implemented");
}
