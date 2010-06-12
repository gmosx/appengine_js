/**
 * @fileOverview An apiproxy stub that calls a remote handler via HTTP.
 *
 * This allows easy remote access to the App Engine datastore, and potentially any
 * of the other App Engine APIs, using the same interface you use when accessing
 * the service locally.
 *
 * UNDER CONSTRUCTION
 */
 
/**
 * Does necessary setup to allow easy remote access to App Engine APIs.
 *
 * Either servername must be provided or app_id must not be None.  If app_id
 * is None and a servername is provided, this function will send a request
 * to the server to retrieve the app_id.
 */ 
exports.configureRemoteApi = function (appId, path) {
}

exports.configureRemoteDatastore = exports.configureRemoteApi;
