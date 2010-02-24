App Engine JavaScript SDK
=========================

Welcome to App Engine for JavaScript! With App Engine, you can build web applications using the JavaScript programming language, and take advantage of the many libraries, tools and frameworks for JavaScript that professional developers use to build world-class web applications. Your JavaScript application runs on Google's scalable infrastructure on top of Java and Rhino, and uses large-scale persistent storage and services.

*This is a community project, not affiliated in any way with Google.*

* Source & Download: [http://github.com/gmosx/appengine/](http://github.com/gmosx/appengine/)
* Status updates: [http://twitter.com/appenginejs](http://twitter.com/appenginejs)
* Homepage: [http://appenginejs.org/](http://appenginejs.org/)
* Documentation: [http://appenginejs.org](http://appenginejs.org)
* Mailing list: [http://groups.google.com/group/appenginejs](http://groups.google.com/group/appenginejs)
* Issue tracking: [http://github.com/gmosx/appengine/issues](http://github.com/gmosx/appengine/issues)
* IRC: #appenginejs on [irc.freenode.net](http://freenode.net/)

This SDK is part of the [Nitro](http://www.nitrojs.org) ecosystem of Web Application development resources. The SDK tracks the latest developments in the <a href="http://commonjs.org">CommonJS</a> group.

This SDK is used in the [narwhal-appengine](http://github.com/gmosx/narwhal-appengine) [Narwhal](http://www.narwhaljs.org) engine to provide a CommonJS compatible API to the App Engine infrastructure.


Design and Implementation
-------------------------

The SDK is powered by [Rhino](http://www.mozilla.org/rhino/) on top of [App Engine Java](http://code.google.com/appengine/docs/java/overview.html). However, the API is based on [App Engine Python](http://code.google.com/appengine/docs/python/overview.html). In our view, the design of the Python API is closer to the JavaScript world. 

As a result, a developer can consult the [App Engine Python](http://code.google.com/appengine/docs/python/overview.html) documentation to work effectively with the JavaScript SDK.

We use JavaScript coding conventions. Python names like 'this_is_a_name' are converted to JavaScript names like 'thisIsAName'. Moreover all delete() functions are renamed to .remove() functions to avoid collisions with the delete keyword (a DELETE() alias is also provided but it's uses is not recommended and may be deprecated in the future). 


Datastore
---------

The Python ext/db api is supported. The API is slightly different to better fit JavaScript.

    var db = require("google/appengine/ext/db");

    var Category = db.Model("Category", {
	    label: new db.StringProperty(),
	    category: new db.ReferenceProperty({referenceClass: Category})
    });

    var c = new Category({keyName: "news", label: News"});
    c.put();
    var key = ...
    var c1 = Category.get(key);
    var c2 = Category.getByKeyName("news");
    var categories = Category.all().limit(3).fetch();
         

Blobstore
--------- 

form:

    var blobstore = require("google/appengine/api/blobstore");

    exports.GET = function(env) {
        return {data: {
            uploadURL: blobstore.createUploadUrl("/test")
        }}
    }

    <form action="{uploadURL}" method="POST" enctype="multipart/form-data">
        <p>
            <input type="file" name="file" />
        </p>
        <p>       
            <button type="submit">Upload</button>
        </p>
    </form>

upload:

    var blobstore = require("google/appengine/api/blobstore");

    exports.GET = function(env) {
        return {data: {
            uploadURL: blobstore.createUploadUrl("/save")
        }}
    }

save:

    var blobstore = require("google/appengine/api/blobstore");

    exports.POST = function(env) {
        var blobs = blobstore.getUploadedBlobs(env);
        
        return {
            status : 303,
            headers : {
                "Location": "/serve?key=" + blobs.file.toString()
            }
        };     
    }
    
serve:

    var blobstore = require("google/appengine/api/blobstore");

    exports.GET = function(env) {
        var params = new Request(env).GET();
        return blobstore.serve(params.key, env);
    }


URL Fetch
---------

Synchronous fetch:

    var fetch = require("google/appengine/api/urlfetch").fetch;

    var response = fetch("http://www.appenginejs.org"),
        html = response.content.decodeToString("UTF-8");

Asynchronous fetch:

    var URLFETCH = require("google/appengine/api/urlfetch");
    
    var rpc = URLFETCH.createRPC(10);
    URLFETCH.makeFetchCall("http://www.appenginejs.org");
    var response = rpc.getResult(),
        html = response.content.decodeToString("UTF-8");


Images
------

    var images = require("google/appengine/api/images");
    var i = images.resize(params.image.data, 640, 480);


Email
-----

    var EmailMessage = require("google/appengine/api/mail").EmailMessage;

    new EmailMessage({
        sender: "george.moschovitis@gmail.com",
        to: "receiver@site.com",
        subject: "My email",
        body: template.render(params)
    }).send();


Memcache
--------

    var memcache = require("google/appengine/api/memcache");
    
    var fragment = memcache.get("fragment");
    if (!fragment) {
        ...
        memcache.set("fragment", fragment);
    }


Users
-----

    var users = require("google/appengine/api/users");
    
    var user = users.getCurrentUser();
    
    if (users.isCurrentUserAdmin()) {
        ...
    }
    
    var url = user.createLoginURL();


Task Queue
----------

    var taskqueue = require("google/appengine/api/labs/taskqueue");
    
    taskqueue.add({url: "/worker", method: "GET", params: {par1: "hello", par2: "world"}});  
    
    var task = new Task({url: "/worker", method: "GET", params: {par1: "hello", par2: "world"}});
    task.add("customqueue");


XMPP
----

Enable the service in WEB-INF/appengine-web.xml:

    <inbound-services>
        <service>xmpp_message</service>
    </inbound-services>

Map a JSGI app at ah/xmpp/message/chat to handle incoming chat messages. Please note that due to current appengine restriction you have to rewrite the PATH_INFO from _ah/... to ah/...

    var Request = require("nitro/request").Request,
       Message = require("google/appengine/api/xmpp").Message;

    exports.GET = exports.POST = function(env) {
       var msg = new Message(env);
       msg.reply("Hello, you said: " + msg.body);
       return {status: 200};
    } 

Send an invite:

    var XMPP = require("google/appengine/api/xmpp");
    XMPP.sendInvite("george.moschovitis@gmail.com");
    

Forms
-----

    var Article = require("article").Article,
        ModelForm = require("google/appengine/ext/db/forms").ModelForm,
        ArticleForm = ModelForm(Article);

        ...
        
    var form = new ArticleForm(params, {instance: article});
        ...
        form.save();


Example
-------

For an example of the usage of this library have a look at the example/ directory. For a more advanced example have a lok at the [blog-gae](http://www.nitrojs.org/appenginejs/blog-gae.tar.gz) example.


Component status
----------------

This library is under construction but usable. Substantial parts of the Python API are converted.

* google/appengine/api/memcache: 80% (usable)
* google/appengine/api/urlfetch: 80% (usable)
* google/appengine/api/mail: 70% (usable)
* google/appengine/api/images: 60% (usable)
* google/appengine/api/users: 80% (usable)
* google/appengine/api/labs/taskqueue: 80% (usable)
* google/appengine/ext/db: 80% (usable, expect minor API changes)
* google/appengine/ext/db/forms: 30% (expect API changes)
* google/appengine/api/xmpp: 80% (usable)
* google/appengine/ext/blobstore: 50% (usable)


Credits
-------

* George Moschovitis, [george.moschovitis@gmail.com](mailto:george.moschovitis@gmail.com)
* Panagiotis Astithas, [pastith@gmail.com](mailto:pastith@gmail.com)
* Christoph Dorn, [christoph@christophdorn.com](mailto:christoph@christophdorn.com)
* Roberto Saccon, [rsaccon@gmail.com](mailto:rsaccon@gmail.com)


Google App Engine
-----------------

This is a community project, not affiliated in any way with Google.

[Google App Engine](http://appengine.google.com) is a service of Google, Inc. Copyright (c) 2009 [Google](http://www.google.com), all rights reserved.


License
-------

Copyright (c) 2009-2010 George Moschovitis, [http://www.gmosx.com](http://www.gmosx.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER 
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
