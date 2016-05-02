"use strict";

var opener = require('./opener'),
    URL = require('url'),
    values = require('./values'),
    fs = require('./fs_helper'),
    server = require('./server'),
    crawlConfig = require('../../Crawlers/crawl_config'),
    https = require('./https_helper');

var token;
try {
    token = require('../../token');
} catch(e){ token = {}; }


var tokenReadyCBs = [],
    beganOauth = false,
    gettingRefreshToken = false;


exports.checkScope = function(){
    
    var oldScope = token.scope.split(" ");
    
    for (var _scope of oldScope){
        if (crawlConfig.scope.indexOf(_scope) < 0)
            return true;
    }
    
    for (var _scope of crawlConfig.scope){
        if (oldScope.indexOf(_scope) < 0)
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
    requestUrl.query.scope = crawlConfig.scope.join(",");

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