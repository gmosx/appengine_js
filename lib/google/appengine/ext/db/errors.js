var defineError = require("google/appengine/utils").defineError;

/*
var KindError = exports.KindError = function(message) {
	this.message = message;
}

KindError.prototype.toString = function() {
	return this.message;
}

var BadValueError = function(message) {
    this.message = message;
}

BadValueError.prototype = Object.create(Error.prototype);

exports.NotSavedError = Error;
*/

exports.KindError = defineError("KindError");
exports.BadValueError = defineError("BadValueError");
exports.NotSavedError = defineError("NotSavedError");
