var db = require("google/appengine/ext/db");

var objectToForm = exports.objectToForm = function(obj) {
	var model = obj.constructor.Model;
    var properties = model.properties;

    var form = "";

    for (var name in properties) {
    	var property = properties[name];
    	var value = obj[name];
    	
    	switch (property.constructor) {
    	case db.StringProperty:
    	    form += '<li><label>' + property.name + '</label><input type="text" name="' + property.name + '" value="' + obj[name] + '"/>';
            break;
            
    	case db.FloatProperty:
    	    form += '<li><label>' + property.name + '</label><input type="text" name="' + property.name + '"';
    	    if (value != undefined)
    	        form += '" value="' + obj[name] + '"';
    	    form += "/>";
    	    break;
    	}
    }

	return form;
}
