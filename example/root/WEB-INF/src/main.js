var Request = require("ringo/webapp/request").Request,
    Message = require("./message").Message;

exports.app = function (env) {
    return exports[env.method](env);
}

exports.GET = function (env) {
    var messages = Message.all().order("-created").fetch(),
        body = '<html><head><link rel="stylesheet" media="screen" href="/screen.css" type="text/css" /></head><body><h1>Guest book</h1>';
    
    if (messages.length > 0) {
        messages.forEach(function (m) {
            body += '<div class="message"><h3>' + m.author + ':</h3><p>' + m.content + '</p>' + m.created + '</div>';
        });
    } else {
        body += '<div class="message">No messages, add the first!</div>';
    }

    body += '<form method="POST"><p><label>Author</label><input type="text" name="author" /></p><p><label>Message</label><textarea name="content"></textarea></p><p><button type="submit">Send</button></p></form><br/><br/>' + new Date() + '</body></html>';

    return {
        status: 200,
        headers: {"Content-Type": "text/html"},
        body: [body]
    }
}

exports.POST = function (env) {
    var params = new Request(env).params,
        msg = new Message(params);

    msg.put();
    
    return {
        status: 303,
        headers: {Location: "/"},
        body: ["See other: /"]
    };
}
