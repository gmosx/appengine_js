var URLFetchServiceFactory = Packages.com.google.appengine.api.urlfetch.URLFetchServiceFactory;

/**
 * http://code.google.com/appengine/docs/java/javadoc/com/google/appengine/api/urlfetch/package-summary.html
 */

var URLFetch = exports.URLFetch = URLFetchServiceFactory.getURLFetchService();
var URL = exports.URL = Packages.java.net.URL;
var HTTPRequest = exports.HTTPRequest = Packages.com.google.appengine.api.HTTPRequest;
var HTTPResponse = exports.HTTPResponse = Packages.com.google.appengine.api.HTTPResponse;
var HTTPMethod = exports.HTTPMethod = Packages.com.google.appengine.api.HTTPMethod;

var JString = Packages.java.lang.String;

var HTTP_METHODS = {
    "DELETE": HTTPMethod.DELETE,
    "GET": HTTPMethod.GET,
    "HEAD": HTTPMethod.HEAD,
    "POST": HTTPMethod.POST,
    "PUT": HTTPMethod.PUT
}

/**
 * The fetch() function makes a synchronous request to fetch a URL. This 
 * function is provided by the google.appengine.api.urlfetch package.
 *
 * The fetch() function returns an object containing the details of the response 
 * returned by the URL's server. This object has several attributes:
 *
 * - content
 * - statusCode
 * - headers
 */
exports.fetch = function(url, payload, method, headers, allowTruncated, followRedirects, deadline) {
    // FIXME: handle all params.
	var response = URLFetch.fetch(URL(url));
    
    return {
        content: String(new JString(response.getContent(), "UTF8")),
        statusCode: response.getResponseCode(),
        headers: {} // FIXME: parse headers!
    }
}
