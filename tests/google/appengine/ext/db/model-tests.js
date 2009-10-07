var assert = require("test/assert");

var db = require("google/appengine/ext/db");

var Base = function() {
}

db.Model.extend(Base, "Base", {
    name: new db.StringProperty(),
    level: new db.FloatProperty()
});

var Child = function() {
}

Base.extend(Child, "Child", {
    another: new db.StringProperty()
});

exports.testModelExtension = function() {
    var props = Child.properties();
    
    assert.isEqual(true, props.level != undefined);
    assert.isEqual(true, props.level != undefined);
}
