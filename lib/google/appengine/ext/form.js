var db = require("google/appengine/ext/db");

/**
 *
 */
exports.objectToForm = function(obj, prefix) {
	var properties = obj.constructor.model.properties;

    var form = "";

    for (var name in properties) {
    	var property = properties[name];
    	var value = obj[name];

        var label = property.name;
        var field = prefix ? prefix + "[" + property.name + "]" : property.name;
            	
    	switch (property.constructor) {
    	case db.StringProperty:
    	    form += '<li><label>' + label + '</label><input type="text" name="' + field + '"';
    	    if (value != undefined)
    	        form += '" value="' + obj[name] + '"';
    	    form += "/>";
            break;

    	case db.IntegerProperty:
    	    form += '<li><label>' + label + '</label><input type="text" name="' + field + '"';
    	    if (value != undefined)
    	        form += '" value="' + obj[name] + '"';
    	    form += "/>";
    	    break;
            
    	case db.FloatProperty:
    	    form += '<li><label>' + label + '</label><input type="text" name="' + field + '"';
    	    if (value != undefined)
    	        form += '" value="' + obj[name] + '"';
    	    form += "/>";
    	    break;

    	case db.DateProperty:
    	case db.DateTimeProperty:
    	    form += '<li><label>' + label + '</label><input type="text" name="' + field + '"';
    	    if (value != undefined)
    	        form += '" value="' + obj[name] + '"';
    	    form += "/>";
            break;

    	case db.TextProperty:
    	    form += '<li><label>' + label + '</label><textarea name="' + field + '">';
    	    if (value != undefined)
    	        form += obj[name];
    	    form += "</textarea>";
            break;
    	}
    }

	return form;
}

/**
 *
 */
exports.formToObject = function(form, obj) {
	var properties = obj.constructor.model.properties;
 
    for (var name in properties) {
        obj[name] = form[name];
    }
    
    return obj;
}
