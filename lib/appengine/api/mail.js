var MailServiceFactory = Packages.com.google.appengine.api.mail.MailServiceFactory,

exports.Mail = MailServiceFactory.getMailService();
exports.Message = Packages.com.google.appengine.api.mail.MailService.Message;