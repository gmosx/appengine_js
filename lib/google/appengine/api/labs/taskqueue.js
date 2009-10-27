var JQueue = Packages.com.google.appengine.api.labs.taskqueue.Queue,
    JQueueFactory = Packages.com.google.appengine.api.labs.taskqueue.QueueFactory,
    JTaskOptionsBuilder = Packages.com.google.appengine.api.labs.taskqueue.TaskOptions.Builder;

var jdefaultQueue = JQueueFactory.getDefaultQueue();

var defineError = function(name) {
    var ctor = function(message) {
        var stack = (new Error).stack.split("\n").slice(1); 
        var [undef, undef, this.fileName, this.lineNumber] = /^(.*?)@(.*?):(.*?)$/.exec(stack[1]); 
        this.stack = stack.join("\n");    
        this.message = message;
    }
    
    ctor.prototype = Object.create(Error.prototype);
    ctor.prototype.constructor = ctor;
    ctor.prorotype.name = name;
    
    return ctor;
}

/**
 * Convenience method will create a Task and add it to the default queue.
 *
 * Args:
 *   *args, **kwargs: Passed to the Task constructor.
 *
 * Returns:
 *   The Task that was added to the queue.
 */
exports.add = function(args) {
}

/**
 * Instantiates a Task object which will describe a unit of offline work. 
 * The instance may be inserted into a queue, so that it will be executed 
 * asynchronously by App Engine.
 */
var Task = exports.Task = function(args) {
}

Task.prototype.add = function(queueName) {
    var jqueue = queueName ?JQueueFactory.getQueue(queueName) : jdefaultQueue;
    
}

/**
 * Instantiates a Queue object which corresponds to either the default queue 
 * (automatically available to all applications) or a user-created queue 
 * defined in queue.yaml. Once instantiated, a Queue object may be used to 
 * insert new Tasks into the system for offline execution.
 */
var Queue = exports.Queue = function(name) {
    this.name = name;
    
    if (name) {
        this._jqueue = JQueueFactory.getQueue(name);
    } else {
        this._jqueue = jdefaultQueue;
    }
}

Queue.prototype.add = function(task) {
    task.add(this)
}
