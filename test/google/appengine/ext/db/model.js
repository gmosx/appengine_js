var assert = require("assert"),
    Helper = require("google/appengine/tools/development/testing").Helper,
    helper = new Helper("datastore");

var db = require("google/appengine/ext/db");

var Base = db.Model.extend("Base", {
    title: new db.StringProperty(),
    level: new db.FloatProperty()
})

var Child = Base.extend("Child", {
    another: new db.StringProperty()
})

exports.testPut = function () {
    helper.setup();
    var b = new Base({title: "hello", level: 2});
    b.put();
    var c = Base.get(b.key());
    assert.equal(c.title, "hello");
    helper.teardown();
}

exports.testModelExtension = function () {
    helper.setup();
    var props = Child.properties();
    assert.ok(props.level);
    helper.teardown();
}

