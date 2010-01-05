var Request = require("jack/request").Request,
    Response = require("jack/response").Response;
    
var Message = require("./message").Message;

exports.app = function(env) {
    return exports[env.REQUEST_METHOD](env);
}

exports.GET = function(env) {
    var messages = Message.all().order("-created").fetch(),
        body = '<html><head><style>label {display: block} .msg { border: 1px solid #ccc; padding: 1em; margin-bottom: 1em }</style></head><body><h1>Guest book</h1>';
    
    if (messages.length > 0) {
        messages.forEach(function(m) {
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

exports.POST = function(env) {
    var params = new Request(env).POST(),
        msg = new Message(params);
        
    msg.put();
    
    return Response.redirect("/");
}
