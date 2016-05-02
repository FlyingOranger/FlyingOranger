var spawn = require('child_process').spawn,
    execFile = require('child_process').execFile,
    opener = require('./opener'),
    fs = require('./fs_helper'),
    startupManager = require('./startup_manager');

var child = null;


exports.create = function(){
    
    
    child = spawn('java', ['-jar', fs.getFullPath('./JavaGUI/JavaGUI.jar')], { detached: true });
    
    child.stdin.write("CONFIG,run_on_startup," + startupManager.getState() + ",");
    
    var message = "";
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
        
        message += chunk;
        if (message.charAt( message.length - 1) === ",")
            parse( message.split(','));
        
        function parse( parts ){
            
            var reset = true;
            if (parts[0] === "EXIT")
                process.exit(0);
            
            else if (parts[0] === "CONFIG"
                     && parts[1] === "run_on_startup" 
                     && parts[2] === "true" || parts[2] === "false"){
                
                startupManager.setState( parts[2] );
                
            } else if (parts[0] === "LINK"){ // assuming this is a link
            
                opener(parts[1]);
            } else 
                reset = false;
            
            if (reset)
                message = "";
        }
    });
      
    child.on('error', err => {
        
        console.error("Could not start the java program.\nThis either happened because Java is not installed on your computer.\nor\nBecause the 'java' keyword is not in your PATH.\nProgram will now exit");
        process.exit(1);
    });
}

exports.newMessage = function(title, link){
    
    if (typeof title === "undefined") title = "empty_title";
    if (typeof link === "undefined") link = "empty_link";
    
    child.stdin.write( title + ',' + link + ',' );
}

exports.exit = function(){
    child.stdin.write('EXIT,');
    child.stdin.end();
    
}