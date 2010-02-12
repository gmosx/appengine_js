var JLogger = Packages.java.util.logging.Logger,
    jlog = JLogger.getLogger("app");

exports.info = function(msg) {
    jlog.info(msg);
}

exports.warning = function(msg) {
    jlog.warning(msg);
}
