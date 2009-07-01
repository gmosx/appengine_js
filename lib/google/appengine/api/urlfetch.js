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

exports.fetch = function(url, method) {
	if (typeof(url) == "string")
		url = new URL(url);
	var response = URLFetch.fetch(url);
	// FIXME: parse headers!
	var content = String(new JString(response.getContent(), "UTF8"));
	return [response.getResponseCode(), {}, content];
}