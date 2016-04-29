"use strict"
var oauth = require('./oauth'),
    http = require('http'),
    URL = require('url');

exports.setUp = function(cb){
    
    var httpServer = http.createServer( (req, res) => {
        
        var url = URL.parse(req.url, true);
        
        if (url.pathname === "/authorize_callback"){
            res.writeHead(200, {'Content-Type': 'text/plain'});
            
            if (url.query.error === "acces_denied"){
                console.error("Authorization error", url.query.error);
                
                
                res.end("Access denied. Please click \"accept\" if you wish to use this service. Retrying in 5 seconds.");
                setTimeout( oauth.requestAccess, 5000);
                
            } else /* Success! */ {
                
                oauth.getTokenFromReddit( url.query.code, () => {
                
                    console.log("Going to close the server...");
                    httpServer.close( () => console.log("Server Closed"));
                    res.end("You're all set!");

                });
                
            }
            
        }
    });
    
    httpServer.listen(5050, () => {
        console.log('Server running at http://127.0.0.1:5050/ and waiting for authorization');
        cb();
    });
    
}
