/**
 * @fileoverview Various internal utilities, not part of the public API.
 */
 
exports.defineError = function (name, Zuper) {
    var ctor = function (message) {
//        var stack = (new Error).stack.split("\n").slice(1); 
//        [undef, undef, this.fileName, this.lineNumber] = /^(.*?)@(.*?):(.*?)$/.exec(stack[1]); 
//        this.stack = stack.join("\n");    
        this.message = message;
    }
    
    Zuper = Zuper || Error;
        
    ctor.prototype = Object.create(Zuper.prototype);
    ctor.prototype.constructor = ctor;
    ctor.prototype.name = name;
    
    return ctor;
}

exports.extend = function (Klass, Zuper) {
    Klass.prototype = Object.create(Zuper.prototype);
    Klass.prototype.constructor = Klass;
}

/**
 * Extract the datastore key from a Model or Key.
 */
exports.datastoreKey = function (model_or_key) {
    throw new Error("not implemented");
}
