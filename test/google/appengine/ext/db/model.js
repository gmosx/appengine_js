var assert = require("assert"),
    testing = require("google/appengine/tools/development/testing");

var db = require("google/appengine/ext/db");

var Base = db.Model.extend("Base", {
    title: new db.StringProperty(),
    level: new db.FloatProperty()
})

var Child = Base.extend("Child", {
    another: new db.StringProperty()
})

exports.testPut = function () {
    testing.setup();
    var b = new Base({title: "hello", level: 2});
    b.put();
    var c = Base.get(b.key());
    assert.equal(c.title, "hello");
    testing.teardown();
}

exports.testModelExtension = function () {
    testing.setup();
    var props = Child.properties();
    assert.ok(props.level);
    testing.teardown();
}

