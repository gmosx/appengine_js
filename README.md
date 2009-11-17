Google App Engine SDK for JavaScript
========================================

Welcome to Google App Engine for JavaScript! With App Engine, you can build web applications using the JavaScript programming language, and take advantage of the many libraries, tools and frameworks for JavaScript that professional developers use to build world-class web applications. Your JavaScript application runs on Google's scalable infrastructure on top of Java and Rhino, and uses large-scale persistent storage and services.

* Homepage: [http://nitrojs.org/](http://nitrojs.org/)
* Source & Download: [http://github.com/gmosx/nitro/](http://github.com/gmosx/appengine/)
* Documentation: [http://nitrojs.org/docs](http://nitrojs.org/docs)
* Mailing list: [http://groups.google.com/group/nitro-devel](http://groups.google.com/group/nitro-devel)
* Issue tracking: [http://github.com/gmosx/nitro/issues](http://github.com/gmosx/appengine/issues)
* IRC: #nitrojs on [irc.freenode.net](http://freenode.net/)    


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


Example
-------

For an example of the usage of this library have a look at the [blog-gae](http://github.com/gmosx/blog-gae) example.


Component status
----------------

This library is under construction but usable. Substantial parts of the Python API are converted.

* google/appengine/api/memcache: 80% (usable)
* google/appengine/api/urlfetch: 80% (usable)
* google/appengine/api/mail: 60% (usable)
* google/appengine/api/images: 40% (usable)
* google/appengine/api/users: 80% (usable)
* google/appengine/api/labs/taskqueue: 80% (usable)
* google/appengine/ext/db: 80% (usable, expect minor API changes)
* google/appengine/ext/db/forms: 30% (expect API changes)


Credits
-------

George Moschovitis <george.moschovitis@gmail.com>


Google App Engine
-----------------

App Engine is a service of Google, Inc. Copyright (c) 2009 Google, all rights reserved.


License
-------

Copyright (c) 2009 George Moschovitis, http://gmosx.com

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
