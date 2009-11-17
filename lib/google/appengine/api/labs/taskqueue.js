/**
 * Task Queue API.
 *
 * Enables an application to queue background work for itself. Work is done through
 * webhooks that process tasks pushed from a queue. Tasks will execute in
 * best-effort order of ETA. Webhooks that fail will cause tasks to be retried at a
 * later time. Multiple queues may exist with independent throttling controls.
 *
 * Webhook URLs may be specified directly for Tasks, or the default URL scheme
 * may be used, which will translate Task names into URLs relative to a Queue's
 * base path. A default queue is also provided for simple usage.
 */

var JQueue = Packages.com.google.appengine.api.labs.taskqueue.Queue,
    JQueueFactory = Packages.com.google.appengine.api.labs.taskqueue.QueueFactory,
    JTaskOptions = Packages.com.google.appengine.api.labs.taskqueue.TaskOptions,
    JTaskOptionsMethod = JTaskOptions.Method;
    JTaskOptionsBuilder = JTaskOptions.Builder;

var HTTP_METHODS = {
    "DELETE": JTaskOptionsMethod.DELETE,
    "GET": JTaskOptionsMethod.GET,
    "HEAD": JTaskOptionsMethod.HEAD,
    "POST": JTaskOptionsMethod.POST,
    "PUT": JTaskOptionsMethod.PUT
}

var jdefaultQueue = JQueueFactory.getDefaultQueue();

var defineError = require("google/appengine/utils").defineError;

/** The queue specified is unknown. */
exports.UnknownQueueError = defineError("UnknownQueueError");

/** 
 * There was a transient error while accessing the queue. 
 * Please Try again later. 
 */
exports.TransientError = defineError("TransientError");

/**
 * Instantiates a Task object which will describe a unit of offline work. 
 * The instance may be inserted into a queue, so that it will be executed 
 * asynchronously by App Engine.
 *
 * All arguments are optional.
 *
 * Arguments:
 * - payload
 * - countdown
 * - eta
 * - headers
 * - method
 * - name
 * - params
 * - url
 */
var Task = exports.Task = function(args) {
    var o = this.jtaskOptions = JTaskOptionsBuilder.withDefaults();
    
    if (args.url) o.url(args.url);
    if (args.name) o.taskName(args.name);
    if (args.eta) o.etaMillis(args.eta);
    if (args.method) o.method(HTTP_METHODS[args.method]);
    
    if (args.params) {
        for (var paramName in args.params) {
            o.param(paramName, args.params[paramName]);
        }
    }
}

/**
 * Adds this Task to a queue. The queue is specified by name. A single Task 
 * instance may only be added to one queue.
 */
Task.prototype.add = function(queueName) {
    var jqueue = queueName ? JQueueFactory.getQueue(queueName) : jdefaultQueue;   
    jqueue.add(this.jtaskOptions);
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
        this.name = "default";
    }
}

/**
 * Add a Task to this Queue.
 */
Queue.prototype.add = function(task) {
    task.add(this)
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
    var task = new Task(args);
    task.add();
}
