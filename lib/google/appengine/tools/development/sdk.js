/**
 * @fileOverview SDK helpers for development.
 */
 
var fs = require("fs");

exports.root = system.env["APPENGINE_JAVA_SDK"];

if (!exports.root) {
    print("Please set the environment variable 'APPENGINE_JAVA_SDK' to the sdk root directory")
}

exports.path = function (path) {
    return fs.join(exports.root, path);
}
