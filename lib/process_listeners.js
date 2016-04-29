var guiController = require('./gui_controller');

module.exports = function(){
    
    
    process.on('uncaughtException', (err) => {
        
        console.error("Caught Exception: ", err.stack);
        console.error("\n");
        
    });
        
    
    process.on('exit', () => {
        
        guiController.exit();
        
    });
    
    
}