// FIXME: these errors are defined but not used yet.

var defineError = require("google/appengine/utils").defineError;

/** 
 * Raised when a property value or filter value is invalid.
 */
exports.BadValueError = defineError("BadValueError");

/** 
 * Raised when a property name isn't a string.
 */
exports.BadPropertyError = defineError("BadPropertyError");

/** 
 * Raised by datastore calls when the parameter(s) are invalid.
 */
exports.BadRequestError = defineError("BadRequestError");

/** 
 * Raised by Query.Order(), Iterator.Next(), and others when they're
 * passed an invalid argument.
 */
exports.BadArgumentError = defineError("BadArgumentError");

/**
 * May be raised by transaction functions when they want to roll back
 * instead of committing. Note that *any* exception raised by a transaction
 * function will cause a rollback. This is purely for convenience. See
 * datastore.RunInTransaction for details.
 */
exports.Rollback = defineError("Rollback");

/**
 * Raised by RunInTransaction methods when the transaction could not be
 * committed, even after retrying. This is usually due to high contention.
 */
exports.TransactionFailedError = defineError("TransactionFailedError");

/**
 * Raised by Query.run() when a filter string is invalid.
 */
exports.BadFilterError = defineError("BadFilterError");

/**
 * Raised by Query when a query or query string is invalid.
 */
exports.BadQueryError = defineError("BadQueryError");

/**
 * Raised by Key.toString() when the key is invalid.
 */
exports.BadKeyError = defineError("BadKeyError");
 
/**
 * An internal datastore error. Please report this to Google.
 */
exports.InternalError = defineError("InternalError");
 
/**
 * No matching index was found for a query that requires an index. Check
 * the Indexes page in the Admin Console and your index.yaml file.
 */
exports.NoIndexError = defineError("NoIndexError");
 
/**
 * The datastore operation timed out, or the data was temporarily
 * unavailable. This can happen when you attempt to put, get, or delete too
 * many entities or an entity with too many properties, or if the datastore is
 * overloaded or having trouble.
 */
exports.Timeout = defineError("Timeout");

/**
 * The write or transaction was committed, but some entities or index rows
 * may not have been fully updated. Those updates should automatically be
 * applied soon. You can roll them forward immediately by reading one of the
 * entities inside a transaction.
 */ 
exports.CommitedButStillapplying = defineError("CommitedButStillapplying", Timeout);

