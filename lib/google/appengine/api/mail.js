/**
 * @fileoverview Sends email on behalf of application.
 * 
 * Provides functions for application developers to provide email services
 * for their applications.  Also provides a few utility methods.
 */

var MailServiceFactory = Packages.com.google.appengine.api.mail.MailServiceFactory,
    Mail = exports.Mail = MailServiceFactory.getMailService(),
    Message = exports.Message = Packages.com.google.appengine.api.mail.MailService.Message;

/**
 * An instance of the EmailMessage class represents an email message, and 
 * includes a method to send the message using the App Engine Mail service. 
 *
 * @constructor
 * @param {Object} fields Default values for the email message.
 */
var EmailMessage = exports.EmailMessage = function (fields) {
    for (var i in fields) this[i] = fields[i];
}

/**
 * Sends the email message. 
 */
EmailMessage.prototype.send = function () {
    var message = new Message();

    message.setSender(this.sender);
    message.setTo(this.to);
    message.setSubject(this.subject);

    if (this.cc) message.setCc(this.cc);
    if (this.bcc) message.setBcc(this.bcc);
    if (this.body) message.setTextBody(this.body);
    if (this.html) message.setHtmlBody(this.html);
    
    Mail.send(message);    
}

EmailMessage.prototype.toString = function () {
    return this.body || this.html;
}

/**
 * Determine if email is invalid.
 * @param {String} emailAddress Email address to check.
 * @returns {boolean} True if the email address is valid.
 */
exports.isEmailValid = function (emailAddress) {
    // FIXME: implement me!
    return true;
}

/**
 * Creates and sends a single email message. sender, to, subject, and body are 
 * required fields of the message. Additional fields can be specified as 
 * keyword arguments. For the list of possible fields, Email Message Fields.
 */
exports.sendMail = function (from, to, subject, body, fields) {
	var message = new Message(from, to, subject, body);
	Mail.send(message);
}

