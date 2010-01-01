Appenginejs Example
===================

A simple Guestbook as an example of a JSGI Web Application powered by appenginejs.


Quick start
===========

Setup the application:

    $ export APPENGINE_JAVA_SDK=/path/to/appengine/sdk
    
Create symbolic links to the required narwhal packages:
    
    $ cd war/WEB-INF/packages
    $ mkdir appengine narwhal jack
    $ ln -s /path/to/appengine/lib appengine/.
    $ ln -s /path/to/appengine/package.json appengine/.
    $ ln -s /path/to/narwhal/lib narwhal/.
    $ ln -s /path/to/narwhal/package.json narwhal/.
    $ ln -s /path/to/jack/lib jack/.
    $ ln -s /path/to/jack/package.json jack/.

Start the dev server:

    $ ant runserver

and browse to http://localhost:8080/


Support
=======

For questions regarding this example or appenginejs please post to the mailing list: [http://groups.google.com/group/appenginejs](http://groups.google.com/group/appenginejs)
