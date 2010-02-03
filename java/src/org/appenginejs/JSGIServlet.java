package org.appenginejs;

import javax.servlet.http.*;
import javax.servlet.*;

import java.io.*;
import java.util.TimeZone;

import org.mozilla.javascript.*;

@SuppressWarnings("serial")
public class JSGIServlet extends HttpServlet {
	private Scriptable scope;
	private Function app;
	private Function handler;
	
    public void init(ServletConfig config) throws ServletException {
    	super.init(config);

        // Set the timezone
        String tz = config.getInitParameter("timezone");
        if (tz != null) {
            TimeZone.setDefault(TimeZone.getTimeZone(tz));
        }

		final String modulesPath = getServletContext().getRealPath(getInitParam(config, "modulesPath", "WEB-INF"));
		final String moduleName = getInitParam(config, "module", "jackconfig.js");
		final String appName = getInitParam(config, "app", "app");
		final int optimizationLevel = Integer.parseInt(getInitParam(config, "optimizationLevel", "9"));
    	
		final String narwhalHome = getServletContext().getRealPath("WEB-INF/packages/narwhal");
		final String narwhalFilename = "engines/rhino/bootstrap.js";
		
		Context context = Context.enter();
		try {
			context.setOptimizationLevel(optimizationLevel);
			scope = new ImporterTopLevel(context);
			
			ScriptableObject.putProperty(scope, "NARWHAL_HOME",  Context.javaToJS(narwhalHome, scope));
			ScriptableObject.putProperty(scope, "SERVLET_CONTEXT",  Context.javaToJS(getServletContext(), scope));
			//ScriptableObject.putProperty(scope, "$DEBUG",  Context.javaToJS(true, scope));

            String environmentName = getInitParam(config, "environment", null);

            if (environmentName == null) {
                // if no explicit environmentName is provided, detect if we run on the
                // actual App Engine Server or the Development server and set the environment
                // accordingly.
                // http://blog.stringbuffer.com/2009/04/determining-if-your-code-is-executing.html
                if (getServletContext().getServerInfo().startsWith("Google App Engine/")) {
                    environmentName = "hosted";
                } else {
                    environmentName = "local";
                }
            }                

			// load Narwhal
			context.evaluateReader(scope, new FileReader(narwhalHome+"/"+narwhalFilename), narwhalFilename, 1, null);

            // WARN: set optimization level after bootstraping!
			context.setOptimizationLevel(optimizationLevel);
			
			// load Servlet handler "process" method
			handler = (Function)context.evaluateString(scope, "require('jack/handler/servlet').Servlet.process;", null, 1, null);
			
			// load the app
			Scriptable module = (Scriptable)context.evaluateString(scope, "require('"+modulesPath+"/"+moduleName+"');", null, 1, null);
			
			app = (Function)module.get(appName, module);

			if (environmentName != null) {
				Object environment = module.get(environmentName, module);
				if (environment instanceof Function) {
					Object args[] = {app};
					app = (Function)((Function)environment).call(context, scope, module, args);
				} else {
					System.err.println("Warning: environment named \"" + environmentName + "\" not found or not a function.");
				}
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			Context.exit();
		}
    }
    
	public void service(HttpServletRequest request, HttpServletResponse response) throws IOException {
		Context context = Context.enter();
		try	{
			Object args[] = {app, request, response};
			handler.call(context, scope, null, args);
		} finally {
			Context.exit();
		}
	}
	
	private String getInitParam(ServletConfig config, String name, String defaultValue) {
        String value = config.getInitParameter(name);
        return value == null ? defaultValue : value;
    }
}
