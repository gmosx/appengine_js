/**
 * Exception raised when the request reaches its overall time limit.
 *
 * Not to be confused with runtime.apiproxy_errors.DeadlineExceededError.
 * That one is raised when individual API calls take too long.
 */
// exports.DeadlineExceededError = Object.create(Error.prototype);

exports.DeadlineExceededError = Packages.com.google.apphosting.api.DeadlineExceededError;
