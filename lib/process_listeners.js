module.exports = function(){

    /* Basically my way of making this app run 
    * continuously even if there's a problem. 
    * In production this will just log errors to the log file */
    process.on('uncaughtException', (err) => {
        
        console.error("Caught Exception: ", err.stack);
        console.error("\r\n");
        
    });
    
}