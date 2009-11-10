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
 * A form tied to a Datastore model.
 * 
 * Usage example:
 *
 *  var db = require("google/appengine/ext/db"),
 *      forms = require("google/appengine/ext/db/forms");
 *
 *  // First, define a model class
 *  var MyModel = db.Model("MyModel", {
 *      foo: new db.StringProperty(),
 *      bar: new db.IntegerProperty({required: true, defaultValue: 42})
 *  });
 *
 *  // Now define a form class
 *  var MyForm = ModelForm(MyModel);
 *
 * You can now instantiate MyForm without arguments to create an
 * unbound form, or with data from a POST request to create a bound
 * form.  You can also pass a model instance with the instance=...
 * keyword argument to create an unbound (!) form whose initial values
 * are taken from the instance.  For bound forms, use the put() method
 * to return a model instance.
 *
 * Like Django's own corresponding ModelForm class, the nested Meta
 * class can have two other attributes:
 *
 *   fields: if present and non-empty, a list of field names to be
 *           included in the form; properties not listed here are
 *           excluded from the form
 *
 *   exclude: if present and non-empty, a list of field names to be
 *            excluded from the form
 *
 * If exclude and fields are both non-empty, names occurring in both
 * are excluded (i.e. exclude wins).  By default all property in the
 * model have a corresponding form field defined.
 *
 * It is also possible to define form fields explicitly.  This gives
 * more control over the widget used, constraints, initial value, and
 * so on.  Such form fields are not affected by the nested Meta class's
 * fields and exclude attributes.
 *
 * If you define a form field named 'keyName' it will be treated
 * specially and will be used as the value for the keyName parameter
 * to the Model constructor. This allows you to create instances with
 * named keys. The 'keyName' field will be ignored when updating an
 * instance (although it will still be shown on the form).
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
/*
    for (var pname in kind.properties()) {
        var p = kind.properties()[pname];
        KindForm.prototype[pname] = function() {
        print("---->>" + pname);
            return p.getFormField(this.instance);
        }
    }
*/    
    return KindForm;
}

// ModelForm extends from Form.
ModelForm.prototype = Object.create(Form.prototype);
ModelForm.constructor = ModelForm;

ModelForm.prototype.asList = ModelForm.prototype.asUl = function() {
    var obj = this.instance,
        properties = this.instance.constructor.properties();

    var html = [];
    
    for (var i in properties) {
        var p = properties[i];
        html.push('<li id="' + p.name + '-field"><label for="' + p.name + '"' + (p.required ? ' class="required"' : "") + '>' + p.verbose() + '</label>' + p.getFormField(obj) + '</li>');
    }
    
    return html.join("");
}

ModelForm.prototype.validate = function() {
    var obj = this.instance,
        properties = this.instance.constructor.properties();

    this.errors = {};
    
    for (var i in properties) {
        var p = properties[i];
        try {
            p.validate(obj[p.name]);
        } catch(e) {
            this.errors[p.name] = e.message;
        }
    }
}

/**
 * Save this form's cleaned data into a model instance.
 *
 *   Args:
 *     commit: optional bool, default True; if true, the model instance
 *             is also saved to the datastore.
 *
 *   Returns:
 *     A model instance.  If a model instance was already associated
 *     with this form instance (either passed to the constructor with
 *     instance=...  or by a previous save() call), that same instance
 *     is updated and returned; if no instance was associated yet, one
 *     is created by this call.
 *
 *   Raises:
 *     ValueError if the data couldn't be validated.
 */
ModelForm.prototype.put = ModelForm.prototype.save = function() {
    this.validate();
    for (var i in this.errors) {
        throw this.errors;
    }
    this.instance.put();
    return this.instance;
}

/**
 */
ModelForm.prototype.field = function(name) {
    return this.instance.constructor.properties()[name].getFormField(this.instance);
}

// Update properties with form related methods. 

/**
 * Return a form field appropriate for this property.
 */
db.Property.prototype.getFormField = function(obj) {
    return '<span>no field</span>';
}

/** 
 * Extract the property value from the instance for use in a form.
 */
db.Property.prototype.getValueForForm = function(obj) {
    return (obj[this.name] || "").toString();
}

/**
 * Convert a form value to a property value.
 */
db.Property.prototype.makeValueFromForm = function(value) {
    return value;
}

db.IntegerProperty.prototype.getFormField = function(obj) {
    return '<input type="number" name="' + this.name + '" value="' + this.getValueForForm(obj) + '"' + (this.required ? ' required="true"' : "") + ' />';
}

db.IntegerProperty.prototype.getValueForForm = function(obj) {
    return obj[this.name];
}

db.IntegerProperty.prototype.makeValueFromForm = function(value) {
    return parseInt(value, 10);
}

db.FloatProperty.prototype.makeValueFromForm = function(value) {
    return parseFloat(value);
}

db.StringProperty.prototype.getFormField = function(obj) {
    return '<input type="text" name="' + this.name + '" value="' + this.getValueForForm(obj) + '"' + (this.required ? ' required="true"' : "") + ' />';
}

db.StringProperty.prototype.makeValueFromForm = function(value) {
    return value;
}

db.TextProperty.prototype.getFormField = function(obj) {
    return '<textarea name="' + this.name + '"' + (this.required ? ' required="true"' : "") + '>' + this.getValueForForm(obj) + '</textarea>';
}

db.TextProperty.prototype.makeValueFromForm = function(value) {
    return value;
}

db.DateTimeProperty.prototype.makeValueFromForm = function(value) {
    return new Date(value);
}

db.ReferenceProperty.prototype.makeValueFromForm = function(value) {
    return new db.Key(value);
}

db.EmailProperty.prototype.getFormField = function(obj) {
    return '<input type="email" name="' + this.name + '" value="' + this.getValueForForm(obj) + '"' + (this.required ? ' required="true"' : "") + ' />';
}

