var query_url = require('./values').query_url,
    https = require('./https_helper'),
    oauth = require('./oauth'),
    gui = require('./gui_controller'),
    fsHelper = require('./fs_helper'),
    fs = require('fs'),
    path = require('path'),
    queryString = require('querystring'),
    URL = require('url');

var AppIntervalIds = {};

/* This function starts all the requests */
exports.startAll = function(){
    
    // just in case, clear all previous intervals if there happen to be any
    exports.stopAll();
    
    for (var appName in exports.appInfo.apps){
        
        exports.startApp( appName );
        
    }
};

exports.startApp = function( appName ){
    
    exports.stopApp( appName );
    
    var app = exports.appInfo.apps[ appName ];
    
    // don't start this app if it's disabled in settings
    if (exports.appInfo.settings.app_specific[ appName ][ "Disable completely" ])
        return;

    AppIntervalIds[ appName ] = setInterval( () => {
        
        // lets let the apps know if this is the first time running ( like on startup )
        // we attach this to app because 
        // in the future if we actually use exports.stop() and start(), 
        // we're only going to create this once.
        app.first = typeof app.first === "undefined";
        
        // cheap way to deep copy this object
        var url_options = JSON.parse(JSON.stringify(query_url.base_options));
        url_options.path = app.path;

        // we need a .json at the end so lets add it if the user forgot
        if (url_options.path.indexOf('.json') < 0)
            url_options.path += '.json';

        // now we'll take care of any queries...
        if ( typeof app.queries === "object"){

            url_options.path += '?';
            url_options.path += queryString.stringify( app.queries );
        }

        // we need an access token to access the user's account
        if ( typeof app.scope !== "undefined"){

            oauth.getAccessToken( access_token => {

                url_options.hostname = query_url.hostname.oauth;
                url_options.headers.authorization = "bearer " + access_token;

                https( url_options, null, 
                      returnedData => app.cb(returnedData.data.children.map( child => child.data ), 
                                                helper(app, url_options, returnedData)));

            });
        } else /* a regular reddit api request */{

            url_options.hostname = query_url.hostname.regular;

            https( url_options, null, 
                  returnedData => app.cb( returnedData.data.children.map( child => child.data ), 
                        helper(app, url_options, returnedData)));
        }

    }, app.interval * 1000);
    
    function helper(app, url_options, returnedData){
    
        return {
            
            settings: exports.appInfo.settings.app_specific[ appName ],
            
            first: app.first,
            
            more: function(){

                if (returnedData.data.after != null){

                    var parsedUrl = URL.parse( url_options.hostname + url_options.path, true );
                    parsedUrl.query.limit = 100;
                    parsedUrl.query.count = 0;
                    parsedUrl.query.after = returnedData.data.after;

                    url_options.path = url_options.path + "?" + queryString.stringify(parsedUrl.query);

                    https( url_options, null, 
                          returnedData => app.cb(returnedData.data.children.map( child => child.data ), 
                                helper(app, url_options, returnedData)));
                }

            },

            set: function(key, objectToSave){

                var savedValues;

                try{
                    savedValues = require('../../Notification_Apps/saved_data');
                } catch (e){
                    savedValues = {};
                }

                if (typeof savedValues[appName] === "undefined")
                    savedValues[appName] = {};

                savedValues[appName][key] = objectToSave;

                fsHelper.writeFile('./Notification_Apps/saved_data.json', savedValues);

            },

            get: function(key){

                var savedValues;

                try{
                    savedValues = require('../../Notification_Apps/saved_data');
                } catch (e){
                    savedValues = {};
                }

                if ( typeof savedValues[appName] === "undefined")
                    return;

                if (typeof savedValues[appName][key] === "undefined")
                    return;

                return savedValues[appName][key];

            },

            notify: function (title, link, fly){ 
                
                if ( exports.appInfo.settings.app_specific[ appName ][ "Disable flying notifications" ]
                  || exports.appInfo.settings[ "disable_all_flying_notifications" ])
                    fly = false;
                
                gui.newMessage( title, link, fly );
                
            }
        };
    }
}

exports.stopAll = function(){
    
    for (var appName in AppIntervalIds){
        clearInterval( AppIntervalIds[ appName ]);
    }
    
}

exports.stopApp = function( appName ){
    clearInterval( AppIntervalIds[ appName ] );
}


/* This function handles loading the notification apps
* by reading the directory. 
* It also handles recording the scope necessary for Oauth 
*/
exports.appInfo = (() => {
    
    var apps = {},
        scope = new Set(),
        settings;
    
    // get the dir path and read it
    var appDir  = fsHelper.getFullPath('./Notification_Apps');
    fs.readdirSync( appDir ).filter( name => path.extname( name ) === ".js")
        .map( name => path.basename( name, ".js"))
        .forEach( appName => {
        
        // require this app and add it to our list
        var app = require('../../Notification_Apps/' + appName);
        apps[ appName ] = app;
        
        // add the scopes this app requires to our set of scopes
        if ( typeof app.scope === "string")
            scope.add( app.scope );
        
        else if (typeof app.scope === "object" && app.scope instanceof Array)
            app.scope.forEach( _scope => scope.add( _scope ));

    });
    
    try {
        settings = require('../../Notification_Apps/settings');
        
    } catch (e){
        settings = {
            "disable_all_flying_notifications": false,
            app_specific: {}
        };
        
    }
    
    // now go through and add settings, only if they haven't already been added
    for (var app_name in apps){
        
        if ( typeof settings.app_specific[app_name] === "undefined"){
            settings.app_specific[app_name] = {
                "Disable completely": false,
                "Disable flying notifications": false
            }
        }

        // custom settings bruh
        if ( typeof apps[app_name].settings === "object"){
            for (var setting_name in apps[app_name].settings){
                if (typeof settings.app_specific[app_name][setting_name] === "undefined")
                    settings.app_specific[app_name][setting_name] = apps[app_name].settings[setting_name];
            }
        }

    }

    fsHelper.writeFile('./Notification_Apps/settings.json', settings);
    
    return { 
        apps: apps,
        scope: scope,
        settings: settings
    };
    
})();