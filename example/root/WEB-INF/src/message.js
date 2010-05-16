var db = require("google/appengine/ext/db");

/**
 * A Guestbook message.
 */
var Message = exports.Message = db.Model.extend("Message", {
    author: new db.StringProperty({required: true, multiline: false}),
    content: new db.TextProperty(),
	created: new db.DateTimeProperty({autoNowAdd: true})
});
