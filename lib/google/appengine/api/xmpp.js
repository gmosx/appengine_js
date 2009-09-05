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
 */

var JXMPP = Packages.com.google.appengine.api.xmpp,
    JXMPPServiceFactory = JXMPP.XMPPServiceFactory;
    
var jservice = JXMPPServiceFactory.getService();    

/**
 * Queries the presence status of a Google Talk user.
 */
exports.getPresence(jid, fromJid) {
}

/**
 * Sends an invitation to a user to chat.
 */
exports.sendInvite(jid, from Jid) {
}

/**
 * Sends a message to a user.
 */
exports.sendMessage(jids, body, fromJid, messageType, rawXML) {
}
