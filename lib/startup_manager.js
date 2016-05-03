"use strict";

var fs = require('fs'),
    fsHelper = require('./fs_helper'),
    path = require('path');

exports.setState = function( state ){

    if (process.platform === "win32"){

        let startupPath = path.join( process.env.APPDATA, 'Microsoft', 'Windows','Start Menu', 'Programs', 'Startup'); 
        let filePath = path.join( startupPath, 'RedditCanFly.bat');

        if (fs.existsSync(startupPath)){
            
            if (state === "true" || typeof state === "boolean" && state){

                let script = 'if not DEFINED IS_MINIMIZED set IS_MINIMIZED=1 && start "" /min "%~dpnx0" %* && exit \r\n';
                script += 'start /MIN "" "' + fsHelper.getFullPath('./node') + '" "' + fsHelper.getFullPath('./start.js') + '" \r\n';
                script += "exit"
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