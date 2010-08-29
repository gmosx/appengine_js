/**
 * @fileoverview The webapp framework is a simple web application framework you can 
 * use for developing JavaScript web applications for App Engine. webapp 
 * is compatible with the JSGI standard for JavaScript web application 
 * containers. webapp provides an easy way to get started developing apps 
 * for App Engine.
 */

/**
 * Abstraction for an HTTP request.
 * Properties:
 *   uri: the complete URI requested by the user
 *   scheme: 'http' or 'https'
 *   host: the host, including the port
 *   path: the path up to the ';' or '?' in the URL
 *   parameters: the part of the URL between the ';' and the '?', if any
 *   query: the part of the URL after the '?'
 *
 * You can access parsed query and POST values with the get() method; do not
 * parse the query string yourself.
 *
 * @constructor
 */
var Request = exports.Request = function () {
}

/**
 * Abstraction for an HTTP response.
 *
 * Properties:
 *   out: file pointer for the output stream
 *   headers: wsgiref.headers.Headers instance representing the output headers
 *
 * @constructor
 */
var Response = exports.Response = function () {
}

/**
 * @constructor
 */
var RequestHandler = exports.RequestHandler = function () {
}

/**
 * @constructor
 */
var JSGIApplication = exports.JSGIApplication = function (urlMapping, debug) {
}

