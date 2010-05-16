AppengineJS Example
===================

A simple Guestbook as an example of a JSGI Web Application powered by AppengineJS. Typically you would like to use a higher level JSGI framework like [Nitro](http://www.github.com/gmosx/nitro).


Quick start
===========

Download the [Google App Engine Java SDK](http://code.google.com/appengine/downloads.html) and make sure that the bin directory of the SDK (/path/to/appengine-java-sdk/bin) is in the path. You can start the example with:
    
    $ cd example
    $ dev_appserver.sh root

and browse to http://localhost:8080/


Deploy to App Engine
====================

To deploy to App Engine:

    $ appcfg.sh --email=your.email@account.com update root 


Directory structure
===================

The directory structure is fully customizable from root/WEB-INF/web.xml. The directory structure choosed in this example is based on [Nitro](http://www.github.com/gmosx/nitro):

    /root - the web app puvlic root directory
    /root/WEB-INF - non public files
    /root/WEB-INF/src - the web app source code
    /root/WEB-INF/lib - java libraries
    /root/WEB-INF/web.xml - web app configuration
    /root/WEB-INF/appengine-web.xml - appengine deployment configuration


Support
=======

For questions regarding this example or appenginejs please post to the mailing list: [http://groups.google.com/group/appenginejs](http://groups.google.com/group/appenginejs)
