/**
 * @fileoverview Allows applications to identify API outages and scheduled downtime.
 *
 * NOT IMPLEMENTED
 */
var JCapabilitiesServiceFactory = Packages.com.google.appengine.api.capabilities.CapabilitiesServiceFactory,
    JCapabilitiesService = JCapabilitiesServiceFactory.getCapabilitiesService();

/**
 *  Creates an implementation of the CapabilitiesService.
 * @{return} JCapabilitiesService
 */
exports.getCapabilitiesService = function() {
	return JCapabilitiesService;
}