var ContentLength = require("jack/contentlength").ContentLength;

exports.app = require("./src/app").app;

exports.local = function(app) {
    return ContentLength(exports.app);
}
