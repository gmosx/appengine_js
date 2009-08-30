/**
 * A conversion of the Python urlfetch api to JavaScript.
 * Implemented on top of the low level Java API.
 *
 * http://code.google.com/appengine/docs/python/urlfetch/
 * http://code.google.com/appengine/docs/java/javadoc/com/google/appengine/api/urlfetch/package-summary.html
 */

var JURLFetch = exports.URLFetch = Packages.com.google.appengine.api.urlfetch;

var JURLFetchService = JURLFetch.URLFetchServiceFactory.getURLFetchService(),
    JURL = Packages.java.net.URL,
    JHTTPRequest = JURLFetch.HTTPRequest,
    JHTTPResponse = JURLFetch.HTTPResponse,
    JHTTPMethod = JURLFetch.HTTPMethod,
    JHTTPHeader = JURLFetch.HTTPHeader,
    JString = Packages.java.lang.String;

var HTTP_METHODS = {
    "DELETE": JHTTPMethod.DELETE,
    "GET": JHTTPMethod.GET,
    "HEAD": JHTTPMethod.HEAD,
    "POST": JHTTPMethod.POST,
    "PUT": JHTTPMethod.PUT
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
    var request = new JHTTPRequest(JURL(url), HTTP_METHODS[method || "GET"]);

    if (headers)
        for (var i in headers) request.addHeader(new JHTTPHeader(i, headers[i]));
    
    if (payload)
        request.setPayload(payload._bytes); // FIXME: implementation specific.
    
    var response = JURLFetchService.fetch(request);
    
    return {
        content: String(new JString(response.getContent(), "UTF8")),
        statusCode: response.getResponseCode(),
        headers: {} // FIXME: parse headers!
    }
}
