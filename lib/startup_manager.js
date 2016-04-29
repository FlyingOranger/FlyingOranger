"use strict";

var fs = require('fs'),
    fsHelper = require('./fs_helper'),
    path = require('path'),
    userConfig = require('../user_config');

module.exports = function(){

    if (process.platform === "win32"){

        let startupPath = path.join( process.env.APPDATA, 'Microsoft', 'Windows','Start Menu', 'Programs', 'Startup'); 
        let filePath = path.join( startupPath, 'RedditCanFly.bat');

        if (userConfig.runOnStartUp){
            if (fs.existsSync(startupPath)){

                let script = "start /MIN node \"" + fsHelper.getFullPath('./RedditCanFly/lib/start_scripts/windows_start.js') + "\"";
                fs.writeFileSync(filePath, script, { encoding: 'utf8'} );

            }

        } else /* Does not want to run on startup */ {

            if (fs.existsSync(filePath))
                fs.unlinkSync(filePath);
            
        }
    }
}