var MailServiceFactory = Packages.com.google.appengine.api.mail.MailServiceFactory,
    Mail = exports.Mail = MailServiceFactory.getMailService(),
    Message = exports.Message = Packages.com.google.appengine.api.mail.MailService.Message;

var EmailMessage = exports.EmailMessage = function(fields) {
}

EmailMessage.prototype.send = function() {
}


exports.isEmailValid = function(email) {
    return true;
}

/**
 * Creates and sends a single email message. sender, to, subject, and body are 
 * required fields of the message. Additional fields can be specified as 
 * keyword arguments. For the list of possible fields, Email Message Fields.
 */
exports.sendMail = function(from, to, subject, body, fields) {
	var message = new Message(from, to, subject, body);
	Mail.send(message);
}

