var datastore = require("google/appengine/api/datastore"),
    JDatastore = datastore.Datastore,
    JQuery = datastore.Query,
	JFetchOptions = Packages.com.google.appengine.api.datastore.FetchOptions,
	JFetchOptionsBuilder = Packages.com.google.appengine.api.datastore.FetchOptions.Builder,
	JString = java.lang.String;

var entityToObject = require("google/appengine/ext/db/utils").entityToObject;

var Key = require("google/appengine/api/datastore/types").Key;

var DESCENDING = JQuery.SortDirection.DESCENDING;

/**
 * The Query class is a datastore query interface that uses objects and methods 
 * to prepare queries.
 */
var Query = exports.Query = function(constructor, keysOnly) {
    this.properties = constructor.properties();
    this.query = new JQuery(constructor.kind());
    if (keysOnly) this.query.setKeysOnly();
}

var FILTER_OPERATORS = {
	"=": JQuery.FilterOperator.EQUAL,
	">": JQuery.FilterOperator.GREATER_THAN,
	">=": JQuery.FilterOperator.GREATER_THAN_OR_EQUAL,
	"<": JQuery.FilterOperator.LESS_THAN,
	"<=": JQuery.FilterOperator.LESS_THAN_OR_EQUAL
}

/**
 * Adds a property condition filter to the query. Only entities with properties 
 * that meet all of the conditions will be returned by the query.
 */
Query.prototype.filter = function(property_op, value) {
	var parts = property_op.split(" ");
	
	if (parts[0] == "__key__") {
	    this.query.addFilter(parts[0], FILTER_OPERATORS[parts[1]], value.datastoreKey());
	} else {
	    var property = this.properties[parts[0]];
	
	    var filterValue;
	    if (property.getFilterValue) { // FIXME: this is a hack, a better solution is needed.
	        filterValue = property.getFilterValue(value);
	    } else {
        	var obj = {};
        	obj[property.name] = value;
        	filterValue = property.getValueForDatastore(obj)
	    }
	
	    this.query.addFilter(parts[0], FILTER_OPERATORS[parts[1]], filterValue);
    }
    
    return this;
}

/**
 * Adds an ordering for the results. Results are ordered starting with the first 
 * order added.
 * @arguments:
 * property
 *   A string, the name of the property to order. To specify that the order 
 *   ought to be in descending order, precede the name with a hyphen (-). Without 
 *   a hyphen, the order is ascending. 
 */
Query.prototype.order = function(property) {
    if (property.begins("-"))
        this.query.addSort(property.slice(1), DESCENDING);
    else
        this.query.addSort(property);
    return this;
}

Query.prototype.ancestor = function(ancestor) {
    this.query.setAncestor(ancestor.datastoreKey());
    return this;
}

Query.prototype.keysOnly = function() {
    this.query.setKeysOnly();
    return this;
}

Query.prototype.limit = function(limit) {
	this.fetchOptions = JFetchOptionsBuilder.withLimit(limit);
	return this;
}

Query.prototype.offset = function(offset) {
	if (!this.fetchOptions) throw Error("Call .limit(n) before calling .offset(n)");
	this.fetchOptions = this.fetchOptions.offset(offset);
	return this;
}

var GREATER_THAN_OR_EQUAL = JQuery.FilterOperator.GREATER_THAN_OR_EQUAL,
	LESS_THAN = JQuery.FilterOperator.LESS_THAN;

/**
 * API extension.
 * Emulates the JDO startsWith operator. 
 * http://groups.google.com/group/google-appengine-java/browse_thread/thread/958851cc674d0c70/7403586fae9ffe20?lnk=gst&q=startswith#7403586fae9ffe20
 */             
Query.prototype.startsWith = function(property, value) {
    this.query.addFilter(property, GREATER_THAN_OR_EQUAL, value);
    this.query.addFilter(property, LESS_THAN, value + "\ufffd");
	return this;
}

Query.prototype.get = function() {
    if (!this.prepared) this.prepared = JDatastore.prepare(this.query);

	entities = this.prepared.asIterator(JFetchOptionsBuilder.withLimit(1));

    if (this.query.isKeysOnly())
	    for (var e in Iterator(entities))
	    	return e.getKey();
    else
	    for (var e in Iterator(entities))
	    	return entityToObject(e);
}

/**
 * Executes the query, then returns the results.
 *
 * The limit and offset arguments control how many results are fetched from the 
 * datastore, and how many are returned by the fetch() method:
 * - The datastore fetches offset + limit results to the application. The first 
 *   offset results are not skipped by the datastore itself.
 * - The fetch() method skips the first offset results, then returns the rest 
 *   (limit results).
 * - The query has performance characteristics that correspond linearly with the 
 *   offset amount plus the limit.
 */
Query.prototype.fetch = function(limit, offset) {
    if (limit) {
        this.limit(limit);
        if (offset) this.offset(offset);
    }
    
    if (!this.prepared) this.prepared = JDatastore.prepare(this.query);

    var objects = [];
    
    var entities;
    if (this.fetchOptions) {
    	entities = this.prepared.asIterator(this.fetchOptions);
    } else {
    	entities = this.prepared.asIterator();
    }
    
    if (this.query.isKeysOnly()) {
	    for (var e in Iterator(entities)) {
	        objects.push(Key.fromDatastoreKey(e.getKey()));
	    }
    } else {
	    for (var e in Iterator(entities)) {
	    	objects.push(entityToObject(e));
	    }
	}

    return objects;    
}

Query.prototype.keys = function(limit, offset) {
	this.query.setKeysOnly();
	return this.fetch();
}

Query.prototype.forEach = function() {
}

Query.prototype.count = function(limit) {
}

