exports.testModel = require("./google/appengine/ext/db/model");

if (module === require.main) {
    java.lang.System.exit(require("test").run(exports));
}    
