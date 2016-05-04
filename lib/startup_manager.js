"use strict";

var fs = require('fs'),
    fsHelper = require('./fs_helper'),
    path = require('path'),
    childProcess = require('child_process'),
    opener = require('./opener');

exports.setState = function( state ){

    if (process.platform === "win32"){

        let startupPath = path.join( process.env.APPDATA, 'Microsoft', 'Windows','Start Menu', 'Programs', 'Startup'); 
        let filePath = path.join( startupPath, 'FlyingOranger.lnk');

        if (fs.existsSync(startupPath)){
            
            if (state === "true" || typeof state === "boolean" && state){

                let args = [];
                
                args.push( fsHelper.getFullPath('./linker.vbs') );
                args.push( filePath );
                args.push( fsHelper.getFullPath('./node') );
                args.push( fsHelper.getFullPath('./start.js') );
                args.push( fsHelper.getFullPath('./w_icon.ico') );
                
                args = args.map( arg => '"' + arg + '"' );
                
                childProcess.execSync('start /MIN /WAIT cscript ' + args.join(" "));
                
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
        let filePath = path.join( startupPath, 'FlyingOranger.lnk');
        
        return fs.existsSync( filePath );
    }
    
}