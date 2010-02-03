/**
 * An App Engine application can send and receive instant messages to and from 
 * any XMPP-compatible instant messaging service, such as Google Talk. An app 
 * can send and receive chat messages, send chat invites, and request status 
 * information. Incoming XMPP messages are handled by request handlers, similar 
 * to web requests.
 *
 * Some possible uses of instant messages include automated chat participants 
 * ("chat bots"), instant notifications, and chat interfaces to services. A 
 * rich client with a connection to an XMPP server (such as Google Talk) can 
 * use XMPP to interact with an App Engine application in real time, including 
 * receiving messages initiated by the app. (Note that such a client using 
 * Google Talk must use the user's password to make an XMPP connection, and 
 * cannot use a Google Accounts cookie.)
 *
 * Example usage:
 *
 * Map the following JSGI app at ah/xmpp/message/chat
 *
 *   var Request = require("nitro/request").Request,
 *       Message = require("google/appengine/api/xmpp").Message;
 *
 *   exports.GET = exports.POST = function(env) {
 *       var msg = new Message(env);
 *       msg.reply("Hello, you said: " + msg.body);
 *       return {status: 200};
 *   } 
 *
 * Due to appengine restrictions you have to rewrite paths starting with _ah to
 * ah, and put your JSGI app in ah/
 */
var JXMPP = Packages.com.google.appengine.api.xmpp,
    JXMPPServiceFactory = JXMPP.XMPPServiceFactory,
    JMessageBuilder = JXMPP.MessageBuilder,
    JMessageType = JXMPP.MessageType,
    JArrayList = java.util.ArrayList,
    JJID = JXMPP.JID;
    
var jservice = JXMPPServiceFactory.getXMPPService();    

exports.MESSAGE_TYPE_NONE = "";
exports.MESSAGE_TYPE_CHAT = JMessageType.CHAT;
exports.MESSAGE_TYPE_ERROR = JMessageType.ERROR;
exports.MESSAGE_TYPE_GROUPCHAT = JMessageType.GROUPCHAT;
exports.MESSAGE_TYPE_HEADLINE = JMessageType.HEADLINE;
exports.MESSAGE_TYPE_NORMAL = JMessageType.NORMAL;

/**
 * Queries the presence status of a Google Talk user.
 */
exports.getPresence = function(jid, fromJid) {
    if (fromJid) {
        return jservice.getPresence(new JJID(jid), new JJID(fromJid)).isAvailable();
    } else {
        return jservice.getPresence(new JJID(jid)).isAvailable();
    }
}

/**
 * Sends an invitation to a user to chat.
 */
exports.sendInvite = function(jid, fromJid) {
    if (fromJid) {
        jservice.sendInvitation(new JJID(jid), new JJID(fromJid));
    } else {
        jservice.sendInvitation(new JJID(jid));
    }
}

/**
 * Sends a chat message to a list of JIDs.
 */
exports.sendMessage = function(jids, body, fromJid, messageType, rawXML) {
    if (typeof(jids) == "string") jids = [jids];
    jids = jids.map(function(jid) { return new JJID(jid); });

    var mb = new JMessageBuilder().withBody(body).withRecipientJids(jids).withMessageType(messageType || exports.MESSAGE_TYPE_CHAT);
    if (fromJid) mb = mb.withFromJid(new JJID(fromJid));
    if (!!rawXML) mb = mb.asXml(true);
    var response = jservice.sendMessage(mb.build());

}

/**
 * Encapsulates an XMPP message received by the application.
 * Constructs a new XMPP Message from an HTTP request.
 *
 * Different from the Python API: The JSGI env is passed.
 */
var Message = exports.Message = function(env) {
    var jmsg = jservice.parseMessage(env["jack.servlet_request"]);
    this.sender = String(jmsg.getFromJid().getId());        
    var to = [],
        rjids = jmsg.getRecipientJids();
    for (var i = 0; i < rjids.length; i++) {
        to.push(String(rjids[i].getId()));
    }
    this.to = to;
    this.body = String(jmsg.getBody());
}

/**
 * Convenience function to reply to a message.
 *
 * Args:
 *  body: str: the body of the message
 *  messageType, rawXML: as per exports.sendMessage.
 *  sendMessage: used for testing.
 */
Message.prototype.reply = function(body, messageType, rawXML, sendMessage) {
    if (!sendMessage) sendMessage = exports.sendMessage;
    sendMessage(this.sender, body, this.to, messageType, rawXML);
}
