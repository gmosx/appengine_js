// Under construction, not working yet.

/**
 * @fileoverview Models to be used when accessing app specific datastore usage statistics.
 *
 * These entities cannot be created by users, but are populated in the
 * application's datastore by offline processes run by the Google App Engine team.
 */
 
var db = require("google/appengine/ext/db");
 
/**
 * Base Statistic Model class.
 * 
 * The 'bytes' attribute represents the total number of bytes taken up in the
 * datastore for the statistic instance.  The 'count' attribute is the
 * total number of occurrences of the statistic in the datastore.  The
 * 'timestamp' is when the statistic instance was written to the datastore.
 *
 * @constructor
 */
var BaseStatistic = new db.Model.extend({
    _kind: "__BaseStatistic__",
    bytes: new db.IntegerProperty(),
    count: new db.IntegerProperty(),
    timestamp: new db.DateTimeProperty()
});

/**
 * Base Statistic Model class for stats associated with kinds.
 *
 * The 'kindName' attribute represents the name of the kind associated with the
 * statistic instance.
 *
 * @constructor
 */
var BaseKindStatistic = BaseStatistic.extend({
    _kind: "__BaseKindStatistic__",
    kindName: new db.StringProperty()
});

/**
 * An aggregate of all entities across the entire application.
 *
 * This statistic only has a single instance in the datastore that contains the
 * total number of entities stored and the total number of bytes they take up.
 * 
 * @constructor
 */ 
exports.GlobalStat = BaseStatistic.extend({
    _kind: "__Stat_Total__"
});

/**
 * An aggregate of all entities at the granularity of their Kind.
 *
 * There is an instance of the KindStat for every Kind that is in the
 * application's datastore.  This stat contains per-Kind statistics.
 * 
 * @constructor
 */ 
exports.KindStat = BaseKindStatistic.extend({
    _kind: "__Stat_Kind__"
});

/**
 * Statistics of the number of root entities in the datastore by Kind.
 *
 * There is an instance of the KindRootEntityState for every Kind that is in the
 * application's datastore and has an instance that is a root entity.  This stat
 * contains statistics regarding these root entity instances.
 * 
 * @constructor
 */
exports.KindRootEntityStat = BaseKindStatistic.extend({
    _kind: "__Stat_Kind_isRootEntity__"
});

/**
 * An aggregate of all properties across the entire application by type.
 *
 * There is an instance of the PropertyTypeStat for every property type
 * (google.appengine.api.datastore_types._PROPERTY_TYPES) in use by the
 * application in its datastore.
 * 
 * @constructor
 */
exports.PropertyTypeStat = BaseStatistic.extend({
    _kind: "__Stat_PropertyType__",
    propertyType: new db.StringProperty()
});

/**
 * Statistics on (kind, propertyType) tuples in the app's datastore.
 *
 * There is an instance of the KindPropertyTypeStat for every
 * (kind, propertyType) tuple in the application's datastore.
 * 
 * @constructor
 */
exports.KindPropertyTypeStat = BaseKindStatistic.extend({
    _kind: "__Stat_PropertyType_Kind__",
    propertyType: new db.StringProperty()
});

/**
 * Statistics on (kind, property_name) tuples in the app's datastore.
 *
 * There is an instance of the KindPropertyNameStat for every
 * (kind, property_name) tuple in the application's datastore.
 * 
 * @constructor
 */
exports.KindPropertyNameStat = BaseKindStatistic.extend({
    _kind: "__Stat_PropertyName_Kind__",
    propertyName: new db.StringProperty()
});

/**
 * Statistic on (kind, propertyName, propertyType) tuples in the datastore.
 *
 * There is an instance of the KindPropertyNamePropertyTypeStat for every
 * (kind, propertyName, propertyType) tuple in the application's datastore.
 * 
 * @constructor
 */
exports.KindPropertyNamePropertyTypeStat = BaseKindStatistic.extend({
    _kind: "__Stat_PropertyType_PropertyName_Kind__",
    propertyType: new db.StringProperty(),
    propertyName: new db.StringProperty()
});

