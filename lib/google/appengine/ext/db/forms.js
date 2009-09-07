var db = require("google/appengine/ext/db");

/**
 *
 */
exports.objectToForm = function(obj, prefix) {
	var properties = obj.constructor.model.properties;

    var form = "";

    for (var name in properties) {
    	var property = properties[name];
    	if (property.editable == false) next;
    	
    	var value = obj[name];

        var label = property.name;
        var field = prefix ? prefix + "[" + property.name + "]" : property.name;

    	switch (property.constructor) {
    	case db.StringProperty:
    	    form += '<li><label>' + label + '</label><input type="text" name="' + field + '"';
    	    if (value != undefined)
    	        form += '" value="' + value + '"';
    	    form += "/>";
            break;

    	case db.IntegerProperty:
    	    form += '<li><label>' + label + '</label><input type="text" name="' + field + '"';
    	    if (value != undefined)
    	        form += '" value="' + value + '"';
    	    form += "/>";
    	    break;
            
    	case db.FloatProperty:
    	    form += '<li><label>' + label + '</label><input type="text" name="' + field + '"';
    	    if (value != undefined)
    	        form += '" value="' + value + '"';
    	    form += "/>";
    	    break;

    	case db.DateProperty:
    	case db.DateTimeProperty:
    	    form += '<li><label>' + label + '</label><input type="text" name="' + field + '"';
    	    if (value != undefined)
    	        form += '" value="' + value + '"';
    	    else 
    	        form += '" value="' + new Date() + '"';
    	    form += "/>";
            break;

    	case db.TextProperty:
    	    form += '<li><label>' + label + '</label><textarea name="' + field + '">';
    	    if (value != undefined)
    	        form += value;
    	    form += "</textarea>";
            break;

    	case db.ReferenceProperty:
    	    form += '<li><label>' + label + '</label>';
    	    if (property.referenceClass) {
        	    form += '<select name="' + field + '">';
        	    var objs = property.referenceClass.all().limit(100).fetch();
        	    for (var i = 0; i < objs.length; i++) {
        	        var obj = objs[i];
           	        form += '<option value="' + db.keyToString(obj.key()) + '"';
        	        if (String(obj.key()) == String(value)) form += ' selected="true"';
            	    form += '>' + obj + '</option>';
        	    }
        	    form += "</select>";
    	    } else {
    	        form += '<input type="text" name="' + field + '"';
        	    if (value != undefined)
        	        form += '" value="' + db.keyToString(value) + '"';
        	    form += "/>";
    	    }
    	    if (value != undefined) {
    	        form += '&nbsp;&nbsp<a href="/admin/db/edit?key=' + db.keyToString(value) + '&ref=true"/>link&raquo;</a>';
    	    }
    	    break;
    	}	
    }

	return form;
}

/**
 *
 */
var formToObject = exports.formToObject = function(form, obj) {
	var properties = obj.constructor.model.properties;
 
    for (var name in properties) {
     	var property = properties[name];
     	print("--- " + name + ": " + property.editable);
     	if (property.editable != false)
            if (form[name]) obj[name] = property.makeValueFromForm(form[name]);
    }
    
    return obj;
}

/**
 * ModelForm
 *
 * Based on Django forms.
 */
var ModelForm = exports.ModelForm = function(kind) {
    var Form = function(params) { 
        var obj = params.__key__ ? kind.get(db.stringToKey(params.__key__)) : Object.create(kind.prototype);
        formToObject(params, obj);
        obj.__key__ = obj.__key__ || kind.key(obj);

        this.params = params;
        this.object = obj;
    }

    Form.prototype = Object.create(ModelForm.prototype);
    Form.constructor = Form;
    
    return Form;
}

ModelForm.prototype.put = ModelForm.prototype.save = function() {
    // TODO: check if isValid()
    this.object.put();
}



db.IntegerProperty.prototype.getValueForForm = function(obj) {
    return obj[this.name];
}

db.StringProperty.prototype.makeValueFromForm = function(value) {
    return value;
}

db.TextProperty.prototype.makeValueFromForm = function(value) {
    return value;
}

db.IntegerProperty.prototype.makeValueFromForm = function(value) {
    return Number(value);
}

db.FloatProperty.prototype.makeValueFromForm = function(value) {
    return Number(value);
}

db.DateTimeProperty.prototype.makeValueFromForm = function(value) {
    return new Date(value);
}

db.ReferenceProperty.prototype.makeValueFromForm = function(value) {
    return db.stringToKey(value);
}
