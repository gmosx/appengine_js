exports.testModel = require("./google/appengine/ext/db/model-tests");

if (require.main === module.id)
    require("os").exit(require("test/runner").run(exports));
