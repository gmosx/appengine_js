/**
 * @fileoverview Channel API.
 * 
 * The Channel API creates a persistent connection between your application and Google servers, allowing
 * your application to send messages to JavaScript clients in real time without the use of polling.
 *
 * Usage :
 *
 *  Step 1. Create channel
 *
 *     var channel = require("google/appengine/api/channel"),
 *         tokenForFoo = null,
 *         tokenForBar = null;
 *
 *     tokenForFoo = channel.createChannel("Foo"); // "Foo" should use this token.
 *     tokenForBar = channel.createChannel("Bar"); // "Bar" should use this token.
 * 
 *  Step 2. Send message
 *
 *     var channel = require("google/appengine/api/channel");
 *
 *     channel.sendMessage("Bar", "Hello"); // Send message "Hello" to "Bar"
 *     channel.sendMessage("Foo", "World"); // Send message "World" to "Foo"
 *
 */
var JChannelServiceFactory = Packages.com.google.appengine.api.channel.ChannelServiceFactory,
    JChannelMessage = Packages.com.google.appengine.api.channel.ChannelMessage,
    JChannelService = JChannelServiceFactory.getChannelService(); 

/**
 * Creates a channel.
 *
 * @param {String} client_id - An application-created string the server uses to identify individual JavaScript clients.
 * @return {String} Returns a token for use by the JavaScript client listening on the channel.
 */
exports.createChannel = function(client_id) {
    var token = null;
    try {
        token = JChannelService.createChannel(client_id);
    } catch (exception) {
        throw exception;
    }
    return token;
};

/**
 * Asynchronously sends a message to a channel.
 * No error is returned if the message cannot be delivered.
 *
 * @param {String} client_id - The key identifying a JavaScript client.
 * @param {String} message - The message passed to the client.
 */
exports.sendMessage = function(client_id, message) {
    try {
        JChannelService.sendMessage(new JChannelMessage(client_id, message));
    } catch (exception) {
        throw exception;
    }
};