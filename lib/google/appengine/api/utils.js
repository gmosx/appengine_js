// Based on the JAVA api:
// com.google.appengine.api.utils
// python version:
// http://code.google.com/appengine/docs/python/runtime.html#The_Environment

// TODO: implement OS.env, or add in jsgi's env.

var JSystemProperty = Packages.com.google.appengine.api.utils.SystemProperty;

exports.applicationId = function () {
    return JSystemProperty.applicationId.get();
}

exports.applicationVersion = function () {
    return JSystemProperty.applicationVersion.get();
}

exports.environment = function () {
    return JSystemProperty.environment.value();
}

exports.version = function () {
    return JSystemProperty.version.get();
}
