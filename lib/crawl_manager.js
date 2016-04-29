var crawlers = require('../user_config').crawlers,
    query_url = require('./values').query_url,
    https = require('./https_helper'),
    oauth = require('./oauth'),
    gui = require('./gui_controller'),
    fs = require('./fs_helper'),
    queryString = require('querystring');

module.exports = function(){
    
    setInterval( () => {
        Object.keys(crawlers).forEach( crawlerName => {
            
            var crawlerCB;
            
            try {
                crawlerCB = require('../crawlers/' + crawlerName);
            } catch(e) {
                console.error("Missing call back function for " + crawlerName + 
                              ". Skipping onto next crawler");
                return;
            }
            
            var url_options = JSON.parse(JSON.stringify(query_url.base_options));
            url_options.path = crawlers[crawlerName].path;

            if ( crawlers[crawlerName].account ){
                
                oauth.getAccessToken( access_token => {

                    
                    url_options.hostname = query_url.hostname.oauth;
                    url_options.headers.authorization = "bearer " + access_token;
                    
                    https( url_options, null, 
                          returnedData => crawlerCB(returnedData, helper(crawlerName)));

                });
            } else /* a regular reddit api request */{
                
                url_options.hostname = query_url.hostname.regular;

                if (url_options.path.indexOf('.json') < 0)
                    url_options.path += '.json';

                if ( typeof crawlers[ crawlerName ].queries === "object"){

                    url_options.path += '?';
                    url_options.path += queryString.stringify( 
                        crawlers[ crawlerName ].queries );
                }

                https( url_options, null, 
                      returnedData => crawlerCB(returnedData, helper(crawlerName, url_options, returnedData)));
            }
        });
    }, 3000);
    
}

function helper(crawlerName, url_options, returnedData){
    
    return {
        
        more: function(cb){
            
            if (returnedData.data.after == null)
                console.error("Cannot retreive more, the after variable is null");
            
            else{
                url_options.path += "&" + queryString.stringify({"after": returnedData.data.after, count: 0});
                
                https( url_options, null, newData => {
                    returnedData = newData;
                    cb(newData);
                });
            }
            
        },
        
        set: function(key, objectToSave){
            
            var savedValues;
            
            try{
                savedValues = require('../crawlers/saved_data');
            } catch (e){
                savedValues = {};
            }
            
            if (typeof savedValues[crawlerName] === "undefined")
                savedValues[crawlerName] = {};
            
            savedValues[crawlerName][key] = objectToSave;
            
            fs.writeFile('./crawlers/saved_data.json', savedValues);
            
        },
        
        get: function(key){
            
            var savedValues;
            
            try{
                savedValues = require('../crawlers/saved_data');
            } catch (e){
                savedValues = {};
            }
            
            if ( typeof savedValues[crawlerName] === "undefined")
                return;
            
            if (typeof savedValues[crawlerName][key] === "undefined")
                return;
            
            return savedValues[crawlerName][key];
            
        },
        
        notify: gui.newMessage
    };
}