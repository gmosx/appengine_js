/**
 * @fileoverview Access to quota usage for this application.
 */

var JQuotaServiceFactory = Packages.google.appengine.api.quota.QuotaServiceFactory,
    jservice = JQuotaServiceFactory.getQuotaService;
 
/**
 * Get the amount of CPU used so far for the current request.
 *
 * Returns the number of megacycles used so far for the current
 * request. Does not include CPU used by API calls.
 *
 * The unit the duration is measured is Megacycles. If all instructions were to 
 * be executed sequentially on a standard 1.2 GHz 64-bit x86 CPU, 1200 
 * megacycles would equate to one second physical time elapsed.
 *
 * Does nothing when used in the dev_appserver.
 */
exports.getRequestCpuUsage = function () {
    return Number(jservice.getCpuTimeInMegaCycles());
}
 
/**
 * Get the amount of CPU used so far by API calls during the current request.
 *
 * Returns the number of megacycles used so far by API calls for the current
 * request. Does not include CPU used by code in the request itself.
 *
 * Does nothing when used in the dev_appserver.
 */
exports.getRequestCpuApiUsage = function () {
    return Number(jservice.getApiTimeInMegaCycles());
}

/**
 * Convert an input value in megacycles to CPU-seconds.
 *
 * Returns a Number (float) representing the CPU-seconds the input megacycle value
 * converts to.
 */
exports.megacyclesToCpuSeconds = function (msycles) {
    return Number(jservice.convertMegacyclesToCpuSeconds(mcycles));
}

/**
 * Convert an input value in CPU-seconds to megacycles.
 *
 * Returns an integer representing the megacycles the input CPU-seconds value
 * converts to.
 */
exports.cpuSecondsToMegacycles = function (cpu) {
    return Number(jservice.convertCpuSecondsToMegacycles(cpu));
}
