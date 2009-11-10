exports.defineError = function(name) {
    var ctor = function(message) {
//        var stack = (new Error).stack.split("\n").slice(1); 
//        [undef, undef, this.fileName, this.lineNumber] = /^(.*?)@(.*?):(.*?)$/.exec(stack[1]); 
//        this.stack = stack.join("\n");    
        this.message = message;
    }
    
    ctor.prototype = Object.create(Error.prototype);
    ctor.prototype.constructor = ctor;
    ctor.prototype.name = name;
    
    return ctor;
}

exports.extend = function(Klass, Zuper) {
    Klass.prototype = Object.create(Zuper.prototype);
    Klass.prototype.constructor = Klass;
}
