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
 * Determine if IP address is valid. Allows square brackets.
 * @param {String} address IP address to check.
 * @returns {boolean} True if the IP address is valid.
 */
function isIpValid(address) {
    var parts = address.replace(/[\[\]]/g, '').split('.');
    for (var i = parts.length; i--;) {
        if (isNaN(parts[i]) || parts[i] < 0 || parts[i] > 255) {
            return false;
        }
    }
    return (parts.length == 4);
}

/**
 * Determine if email is invalid.
 * @param {String} emailAddress Email address to check.
 * @returns {boolean} True if the email address is valid.
 */
exports.isEmailValid = function (emailAddress) {
    var parts  = emailAddress.split("@");
    var local  = parts[0];
    var domain = parts[1];
    
    var localValid  = false;
    var domainValid = false;
    
    /**
     * The local-part of the email address may use any of these ASCII characters:
     * - Uppercase and lowercase English letters (a–z, A–Z)
     * - Digits 0 to 9
     * - Characters ! # $ % & ' * + - / = ? ^ _ ` { | } ~
     * - Character . (dot, period, full stop) provided that it is not the  
     *   first or last character, and provided also that it does not appear
     *   two or more times consecutively (e.g. John..Doe@example.com).
     */
    if (/^[a-z0-9!#$%&'*+-/=?^_`{|}~]+$/i.test(local) 
     && local.charAt(0) != '.' 
     && local.charAt(local.length-1) != '.'
     && local.indexOf("..") == -1 ) {
        localValid = true;
    } 
    
    /**
     * It must match the requirements for a hostname,
     * consisting of letters, digits, hyphens and dots.
     * In addition, the domain part may be an IP address 
     * literal, surrounded by square braces [192.168.2.1]
     */
    if (/^[a-z0-9-.]+$/i.test(domain)
     || (/^\[[0-9.]+\]+$/i.test(domain) && isIpValid(domain))) {
        domainValid = true;
    } 
    
    return (localValid && domainValid && parts.length == 2);
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

