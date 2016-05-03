var apps = require('../../Notification_Apps/notification_apps_info').notification_apps,
    query_url = require('./values').query_url,
    https = require('./https_helper'),
    oauth = require('./oauth'),
    gui = require('./gui_controller'),
    fs = require('./fs_helper'),
    queryString = require('querystring'),
    URL = require('url');

module.exports = function(){
    
    setInterval( () => {
        Object.keys(apps).forEach( appName => {
            
            var appCB;
            
            try {
                appCB = require('../../Notification_Apps/' + appName);
            } catch(e) {
                console.error("Missing call back function for " + appName + 
                              ". Skipping onto next app");
                return;
            }
            
            var url_options = JSON.parse(JSON.stringify(query_url.base_options));
            url_options.path = apps[appName].path;

            if ( apps[appName].account ){
                
                oauth.getAccessToken( access_token => {

                    
                    url_options.hostname = query_url.hostname.oauth;
                    url_options.headers.authorization = "bearer " + access_token;
                    
                    https( url_options, null, 
                          returnedData => appCB(returnedData.data.children.map( child => child.data ), 
                                                    helper(appName, appCB, url_options, returnedData)));

                });
            } else /* a regular reddit api request */{
                
                url_options.hostname = query_url.hostname.regular;

                if (url_options.path.indexOf('.json') < 0)
                    url_options.path += '.json';

                if ( typeof apps[ appName ].queries === "object"){

                    url_options.path += '?';
                    url_options.path += queryString.stringify( 
                        apps[ appName ].queries );
                }

                https( url_options, null, 
                      returnedData => appCB( returnedData.data.children.map( child => child.data ), 
                            helper(appName, appCB, url_options, returnedData)));
            }
        });
    }, 3000);
    
}

function helper(appName, appCB, url_options, returnedData){
    
    return {
        
        more: function(){
            
            if (returnedData.data.after != null){
                
                var parsedUrl = URL.parse( url_options.hostname + url_options.path, true );
                parsedUrl.query.limit = 100;
                parsedUrl.query.count = 0;
                parsedUrl.after = returnedData.data.after;
                
                url_options.path = parsedUrl.pathname + "?" + queryString.stringify(parsedUrl.query);
                
                https( url_options, null, 
                      returnedData => appCB(returnedData.data.children.map( child => child.data ), 
                            helper(appName, appCB, url_options, returnedData)));
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
            
            fs.writeFile('./Notification_Apps/saved_data.json', savedValues);
            
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
        
        notify: gui.newMessage
    };
}