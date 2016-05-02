"use strict";

var fs = require('fs'),
    fsHelper = require('./fs_helper'),
    path = require('path');

// Here we are just assuming they always want it to launch on startup

exports.setState = function( state ){

    if (process.platform === "win32"){

        let startupPath = path.join( process.env.APPDATA, 'Microsoft', 'Windows','Start Menu', 'Programs', 'Startup'); 
        let filePath = path.join( startupPath, 'RedditCanFly.bat');

        if (fs.existsSync(startupPath)){
            
            if (state === "true"){

                let script = 'start /MIN "" "' + fsHelper.getFullPath('./node') + '" "' + fsHelper.getFullPath('./start.js') + '"';
                fs.writeFileSync(filePath, script, { encoding: 'utf8'} );
                
            } else { // user doesn't want to launch on startup
                
                if (fs.existsSync( filePath ))
                    fs.unlinkSync( filePath );
                
            }
        }
    }
}

exports.getState = function(){
    
    if (process.platform === "win32"){
        
        let startupPath = path.join( process.env.APPDATA, 'Microsoft', 'Windows','Start Menu', 'Programs', 'Startup'); 
        let filePath = path.join( startupPath, 'RedditCanFly.bat');
        
        return fs.existsSync( filePath );
    }
    
}