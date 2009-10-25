var db = require("google/appengine/ext/db");

/**
 *
 */
exports.objectToForm = function(obj, prefix) {
	var properties = obj.constructor.properties();

    var form = "";

    for (var name in properties) {
    	var property = properties[name];
    	if (property.editable == false) continue;
    	
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
	var properties = obj.constructor.properties();
 
    for (var name in properties) {
     	var property = properties[name];
     	if (property.editable != false) {
            if (form[name]) obj[name] = property.makeValueFromForm(form[name]);
        }
    }

    return obj;
}





/**
 * Encapsulates a form. Based on Django forms.
 *
 * http://docs.djangoproject.com/en/dev/topics/forms/
 */
var Form = exports.Form = function() {
}

/**
 * ModelForm. Based on Django forms.
 *
 * http://docs.djangoproject.com/en/dev/topics/forms/modelforms/
 */
var ModelForm = exports.ModelForm = function(kind) {
    var KindForm = function(data, options) { 
        options = options || {};
        
        if (options.instance) {
            this.instance = options.instance;
        } else {
            this.instance = new kind();
        }

        formToObject(data, this.instance);
    }

    KindForm.prototype = Object.create(ModelForm.prototype);
    KindForm.constructor = KindForm;
    
    return KindForm;
}

// TODO: check if isValid()
ModelForm.prototype.put = ModelForm.prototype.save = function() {
    this.instance.put();
    return this.instance;
}

db.IntegerProperty.prototype.getValueForForm = function(obj) {
    return obj[this.name];
}

db.StringProperty.prototype.makeValueFromForm = function(value) {
    return value;
}

db.StringProperty.prototype.getFormField = function() {
}

db.TextProperty.prototype.makeValueFromForm = function(value) {
    return value;
}

db.IntegerProperty.prototype.makeValueFromForm = function(value) {
    return parseInt(value, 10);
}

db.FloatProperty.prototype.makeValueFromForm = function(value) {
    return parseFloat(value);
}

db.DateTimeProperty.prototype.makeValueFromForm = function(value) {
    return new Date(value);
}

db.ReferenceProperty.prototype.makeValueFromForm = function(value) {
    return new db.Key(value);
}
