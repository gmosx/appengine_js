var datastore = require("google/appengine/api/datastore"),
    JDatastore = datastore.Datastore,
    JQuery = datastore.Query,
	JFetchOptions = Packages.com.google.appengine.api.datastore.FetchOptions,
	JFetchOptionsBuilder = Packages.com.google.appengine.api.datastore.FetchOptions.Builder,
	JCursor = Packages.com.google.appengine.api.datastore.Cursor,
	JString = java.lang.String;

var entityToObject = require("google/appengine/ext/db/utils").entityToObject;

var Key = require("google/appengine/api/datastore/types").Key;

var DESCENDING = JQuery.SortDirection.DESCENDING;

/**
 * The Query class is a datastore query interface that uses objects and methods 
 * to prepare queries.
 * @constructor
 * @param {} modelClass The class of the Model (or Expando) that represents the datastore entity kind for the query.
 * @param {boolean} keysOnly Whether the query should return full entities or only keys.
 * @param {boolean} compile Whether the query should also return a compiled query.
 * @param {} cursor A compiled query from which to resume.
 * @param {string} namespace The namespace to query.
 */
var Query = exports.Query = function (modelClass, keysOnly, compile, cursor, namespace) {
    this.properties = modelClass.properties();
    this.query = new JQuery(modelClass.kind()); // gmosx: not your father's jQuery ;-)
    if (keysOnly) this.query.setKeysOnly();
    // TODO: handle compiled, namespace.
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
Query.prototype.filter = function (property_op, value) {
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
Query.prototype.order = function (property) {
    if (property.substr(0,1) == "-")
        this.query.addSort(property.slice(1), DESCENDING);
    else
        this.query.addSort(property);
    return this;
}

Query.prototype.ancestor = function (ancestor) {
    this.query.setAncestor(ancestor.datastoreKey());
    return this;
}

Query.prototype.keysOnly = function () {
    this.query.setKeysOnly();
    return this;
}

// FIXME: Deprecate, not available in the Python SDK, use fetch()
Query.prototype.limit = function (limit) {
    if (!this.fetchOptions) {
    	this.fetchOptions = JFetchOptionsBuilder.withLimit(limit);
    } else {
        this.fetchOptions.limit(limit);
    }
	return this;
}

// FIXME: Deprecate, not available in the Python SDK, use fetch()
Query.prototype.offset = function (offset) {
	if (!this.fetchOptions) throw Error("Call .limit(n) before calling .offset(n)");
	this.fetchOptions = this.fetchOptions.offset(offset);
	return this;
}

/**
 * Set the start of this query to the given serialized cursor.
 *
 * When executed, this query will start from the next result for a previous
 * invocation of a similar query.
 *
 * Returns:
 *   This Query instance, for chaining.
 */
Query.prototype.withCursor = function (cursor) {
    if (cursor) {
        var jcursor = JCursor.fromWebSafeString(cursor);
        
        if (!this.fetchOptions) {
        	this.fetchOptions = JFetchOptionsBuilder.withCursor(jcursor);
        } else {
            this.fetchOptions.cursor(jcursor);
        }
    }
        
    return this;
}

var GREATER_THAN_OR_EQUAL = JQuery.FilterOperator.GREATER_THAN_OR_EQUAL,
	LESS_THAN = JQuery.FilterOperator.LESS_THAN;

/**
 * API extension.
 * Emulates the JDO startsWith operator. 
 * http://groups.google.com/group/google-appengine-java/browse_thread/thread/958851cc674d0c70/7403586fae9ffe20?lnk=gst&q=startswith#7403586fae9ffe20
 */             
Query.prototype.startsWith = function (property, value) {
    this.query.addFilter(property, GREATER_THAN_OR_EQUAL, value);
    this.query.addFilter(property, LESS_THAN, value + "\ufffd");
	return this;
}

Query.prototype._prepare = function (args) {
    if (!this.prepared) {
        if (args && args.rpc) {
            this.prepared = args.rpc.getDatastore().prepare(this.query);
        } else {
            // THINK: remove this special case.
            this.prepared = JDatastore.prepare(this.query);
        }
    }
}

/**
 * Iterator for this query.
 *
 * If you know the number of results you need, consider fetch() instead,
 * or use a GQL query with a LIMIT clause. It's more efficient.
 *
 * Returns:
 *   Iterator for this query.
 */
Query.prototype.run = function (args) {
    this._prepare(args);
    
    if (this.fetchOptions) {
    	var iterator = this.prepared.asQueryResultIterator(this.fetchOptions);
    } else {
    	var iterator = this.prepared.asQueryResultIterator();
    }

    // Python SDK compiled query, used for cursor calculation.
    this._last_raw_query = iterator;
    
    return iterator;
}

/**
 *
 */
Query.prototype.get = function (args) {
    this._prepare(args);
    
    var e = this.prepared.asSingleEntity();
    
    if (e) {
        if (this.query.isKeysOnly()) {
        	return e.getKey();
        } else {
        	return entityToObject(e);
        }        	    	
    }
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
Query.prototype.fetch = function (limit, args) {
    if (limit) {
        this.limit(limit);
        if (args && args.offset) {
            this.offset(args.offset);
        }
    }

    var iterator = this.run(args),
        objects = [];
    
    if (this.query.isKeysOnly()) {
	    for (var e in Iterator(iterator)) {
	        objects.push(Key.fromDatastoreKey(e.getKey()));
	    }
    } else {
	    for (var e in Iterator(iterator)) {
	    	objects.push(entityToObject(e));
	    }
	}

    return objects;    
}

/**
 * Get a serialized cursor for an already executed query.
 *
 * The returned cursor effectively lets a future invocation of a similar query 
 * to begin fetching results immediately after the last returned result from 
 * this query invocation.
 *
 * Returns:
 *   A base64-encoded serialized cursor.
 */
Query.prototype.cursor = function () {
    if (this._last_raw_query) {
        return this._last_raw_query.getCursor().toWebSafeString();
    }
} 

Query.prototype.keys = function (limit, args) {
	this.query.setKeysOnly();
	return this.fetch(limit, args);
}

/**
 * API Extension.
 */
Query.prototype.forEach = function (func, args) {
    var iterator = this.run(args);

    if (this.query.isKeysOnly()) {
        for (var e in Iterator(iterator)) {
            func(Key.fromDatastoreKey(e.getKey()));
        }    
    } else {
	    for (var e in Iterator(iterator)) {
	    	func(entityToObject(e));
	    }
	}
}

Query.prototype.count = function (limit, args) {
    if (limit) {
        this.limit(limit);
    }
 
    this._prepare(args);

    return Number(this.prepared.countEntities());
}
