var guiController = require('./gui_controller'),
    fsHelper = require('./fs_helper'),
    fs = require('fs');

module.exports = function(){
    
    
    process.on('uncaughtException', (err) => {
        
        console.error("Caught Exception: ", err.stack);
        console.error("\r\n");
        
    });
    
    process.on('exit', code => {
       
        var lockPath = fsHelper.getFullPath('./lock.json');
        fs.unlinkSync( lockPath );
        
    });
    
}