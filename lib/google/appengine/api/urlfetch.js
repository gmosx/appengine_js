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
    JString = Packages.java.lang.String,
    JTimeUnit = Packages.java.util.concurrent.TimeUnit;
    
var ByteString = require("binary").ByteString;

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
    var request = createRequest(url, payload, method, headers, allowTruncated, followRedirects, deadline),
        response = JURLFetchService.fetch(request);
    return parseResponse(response);
}

/**
 * callback is not supported at the moment.
 */
exports.createRPC = function(deadline, callback) {
    return new RPC(deadline, callback);
}

/**
 *
 */
exports.makeFetchCall = function(rpc, url, payload, method, headers, allowTruncated, followRedirects, deadline) {
    var request = createRequest(url, payload, method, headers, allowTruncated, followRedirects, deadline);
    rpc._future = JURLFetchService.fetchAsync(request);
    return rpc;
}

/**
 *
 */
var RPC = function(deadline, callback) {
    this.deadline = deadline;
}

/**
 *
 */
RPC.prototype.wait = function() {
    var response = this.deadline ? this._future.get(this.deadline, JTimeUnit.SECONDS) : this._future.get();
    if (this.callback) {
        this.callback.call();
    }
}

/**
 *
 */
RPC.prototype.checkSuccess = function() {
    this.wait();
}
 
/**
 *
 */
RPC.prototype.getResult = function() {
    var response = this.deadline ? this._future.get(this.deadline, JTimeUnit.SECONDS) : this._future.get();
    return parseResponse(response);
}

var createRequest = function(url, payload, method, headers, allowTruncated, followRedirects, deadline) {
    var request = new JHTTPRequest(JURL(url), HTTP_METHODS[method || "GET"]);

    if (headers) {
        for (var i in headers) request.addHeader(new JHTTPHeader(i, headers[i]));
    }
           
    if (payload) {
        if (typeof(payload) == "string") {
            request.setPayload(new JString(payload).getBytes("UTF-8"));
        } else {
            request.setPayload(payload._bytes); // FIXME: implementation specific.
        }
    }

    return request;
}

var parseResponse = function(response) {
/*
    var b = new ByteString();
    b._bytes = response.getContent();
    b._offset = 0;
    b._length = Number(b._bytes.length);
*/
    var b = new ByteString.wrap(response.getContent());
     
    var headers = {};
    for (var h in Iterator(response.getHeaders())) {
        headers[String(h.getName())] = String(h.getValue());
    }    
     
    return {
        content: b,
        finalUrl: String(response.getFinalUrl()),
        statusCode: response.getResponseCode(),
        headers: headers
    }
}
