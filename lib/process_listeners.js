module.exports = function(){

    process.on('uncaughtException', (err) => {
        
        console.error("Caught Exception: ", err.stack);
        console.error("\r\n");
        
    });
    
}