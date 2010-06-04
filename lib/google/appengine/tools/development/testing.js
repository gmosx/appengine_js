/**
 * @fileOverview Local Unit Testing support.
 *
 * Since there is no Python equivalent at the moment, we provive the 
 * appengine-jruby API. The lower level Java API is also exposed.
 *
 * http://code.google.com/appengine/docs/java/tools/localunittesting.html
 * http://code.google.com/p/appengine-jruby/source/browse/appengine-apis/lib/appengine-apis/testing.rb
 */

var sdk = require("google/appengine/tools/development/sdk");

// Include runtime and testing jars.
addToClasspath(sdk.path("/lib/impl/appengine-api.jar"));
addToClasspath(sdk.path("/lib/impl/appengine-api-labs.jar"));
addToClasspath(sdk.path("/lib/impl/appengine-api-stubs.jar"));
addToClasspath(sdk.path("/lib/testing/appengine-testing.jar"));

/** 
 * The Java API. 
 */
var jtesting = exports.java = Packages.com.google.appengine.tools.development.testing;

var serviceMap = {
    blobstore: jtesting.LocalBlobstoreServiceTestConfig,
    datastore: jtesting.LocalDatastoreServiceTestConfig,
    images: jtesting.LocalImagesServiceTestConfig,
    mail: jtesting.LocalMailServiceTestConfig,
    memcache: jtesting.LocalMemcacheServiceTestConfig,
    taskqueue: jtesting.LocalTaskQueueTestConfig,
    urlfetch: jtesting.LocalURLFetchServiceTestConfig,
    users: jtesting.LocalUserServiceTestConfig,
    xmpp: jtesting.LocalXMPPServiceTestConfig
}

/**
 * Local service test helper.
 * @constructor
 * @param {array=} services An optional array with the name of services to setup,
 *                 if no array is passed, config all services.
 */
var Helper = exports.Helper = function (services) {
    services = services || Object.keys(serviceMap);
    
    this.config = {};
    var self = this;
    this._jhelper = new jtesting.LocalServiceTestHelper(
        services.map(function (s) { 
            self.config[s] = new serviceMap[s](); 
            return self.config[s];
        })
    );    
}

Helper.prototype.setup = function () {
    this._jhelper.setUp();
}

Helper.prototype.teardown = function () {
    this._jhelper.tearDown();
}

/**
 * The standard helper.
 */
exports.helper;

/**
 * Standard unit test setup, enables all services.
 */
exports.setup = exports.setUp = function () {
    exports.helper = exports.helper || new Helper();
    exports.helper.setup();
}

/**
 * Standard unit test tear down.
 */
exports.teardown = exports.tearDown = function () {
    if (exports.helper) {
        exports.helper.teardown();
    } else {
        throw new Error("Standard helper is not setup");
    }        
}
