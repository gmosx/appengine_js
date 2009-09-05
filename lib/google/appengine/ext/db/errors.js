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
