"use strict";

var opener = require('./opener'),
    URL = require('url'),
    values = require('./values'),
    fs = require('./fs_helper'),
    server = require('./server'),
    https = require('./https_helper'),
    appManager = require('./apps_manager');


/* ahh.. the process of Oauth2.
* This is what started it all, I just wanted to see if I could
* log into my reddit account with a script and here we are.
* 
* If one of our notification apps needs the access token, it calls 
* exports.getAccessToken. This starts the whole process of Oauth 
* if we don't already have the token, which is then stored
* in ./token.json in the root diretory.
*/

var token;
try {
    token = require('../../token');
} catch(e){ token = {}; }


var tokenReadyCBs = [],
    beganOauth = false,
    gettingRefreshToken = false;

/* returns true if the old scope is any different than the current scope */
exports.checkScope = function(){
    
    var currentScope = appManager.appInfo.scope;
    
    var oldScope = new Set(token.scope.split(" "));
    
    for (var _oldScope of oldScope){
        if ( !currentScope.has(_oldScope) )
            return true;
    }
    
    for (var _currentScope of currentScope){
        if ( !oldScope.has( _currentScope) )
            return true;
    }
    
    return false;
    
}
exports.beginOauth = function(){
    beganOauth = true;
    server.setUp(exports.requestAccess);
}

exports.requestAccess = function(){

    var requestUrl = URL.parse(values.request_authorization_url.base);
    
    requestUrl.query = values.request_authorization_url.queries;
    requestUrl.query.client_id = values.client_id;
    requestUrl.query.scope = Array.from( appManager.appInfo.scope ).join(",");

    opener( URL.format(requestUrl) );
    
    // If the user doesn't accept, or closes... relaunch in 30 seconds.
    setTimeout( () => {
        if (beganOauth){
            exports.requestAccess();
        }
    }, 30000 );
            
    
}

exports.getTokenFromReddit = function(code, cb){
    
    var url_options = values.auth_token.url_options;
    url_options.auth = values.client_id + ":" + "";
    
    var dataToSend = values.auth_token.post_data.beginning + code + values.auth_token.post_data.end;
    
    https( url_options, dataToSend, returnedData => {
        
        token.access_token = returnedData.access_token;
        token.refresh_token = returnedData.refresh_token;
        token.token_time = Math.floor( Date.now() / 1000 );
        token.scope = returnedData.scope;
        exports.writeTokenToFile();
        cb();
        
        for (var tokenCB of tokenReadyCBs)
            tokenCB(token.access_token);
        
        tokenReadyCBs = [];
        beganOauth = false;
    });
    
}

exports.refreshToken = function(){
    gettingRefreshToken = true;
    
    var url_options = values.refresh_token_url.url_options;
    url_options.auth = values.client_id + ":" + "";
    
    var dataToSend = values.refresh_token_url.post_data.beginning + token.refresh_token;
    
    https( url_options, dataToSend, returnedData => {
        
        token.access_token = returnedData.access_token;
        token.token_time = Math.floor( Date.now() / 1000 );
        token.scope = returnedData.scope;
        exports.writeTokenToFile();
        
        for (var tokenCB of tokenReadyCBs)
            tokenCB(token.access_token);
        
        tokenReadyCBs = [];
        gettingRefreshToken = false;
        
    });
    
}

exports.getAccessToken = function(cb){
    
    if (typeof token.access_token === "undefined"
       || exports.checkScope()){
        
        if (!beganOauth) exports.beginOauth();
        tokenReadyCBs.push(cb);
    }
    
    else {
        
        let currentTime = Math.floor( Date.now() / 1000 );
        
        if (currentTime - token.token_time >= 3600 ){
            if (!gettingRefreshToken) exports.refreshToken();
            tokenReadyCBs.push(cb);
            
        }
        
        /* keep this function asynchronous */
        else process.nextTick(() => cb(token.access_token));
    }
}

exports.writeTokenToFile = function(){
    
    fs.writeFile('./token.json', token);
    
}                         