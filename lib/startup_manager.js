"use strict";

var fs = require('fs'),
    fsHelper = require('./fs_helper'),
    path = require('path');

// Here we are just assuming they always want it to launch on startup

module.exports = function(){

    if (process.platform === "win32"){

        let startupPath = path.join( process.env.APPDATA, 'Microsoft', 'Windows','Start Menu', 'Programs', 'Startup'); 
        let filePath = path.join( startupPath, 'RedditCanFly.bat');
        

        if (fs.existsSync(startupPath)){

            let script = "start /MIN \"" + fsHelper.getFullPath('./w_start.bat') + "\"";
            fs.writeFileSync(filePath, script, { encoding: 'utf8'} );
            
        }

       /* } else  Does not want to run on startup  {

            if (fs.existsSync(filePath))
                fs.unlinkSync(filePath);
            
        }*/
    }
}