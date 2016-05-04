var spawn = require('child_process').spawn,
    execFile = require('child_process').execFile,
    exec = require('child_process').exec,
    opener = require('./opener'),
    fs = require('./fs_helper'),
    startupManager = require('./startup_manager'),
    lock = require('../../lock.json');

var child = null;


exports.create = function(){
    
    child = spawn('java', ['-jar', fs.getFullPath('./JavaGUI/JavaGUI.jar')], { detached: true });
    
    lock.JavaGUI = child.pid;
    fs.writeFile("./lock.json", lock);
    
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
            
                if (process.platform === "win32")
                    exec('start /MIN "" ' + parts[1]);
                else opener(parts[1]);
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
    
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', chunk => {
        message += chunk;
        console.error(message, "\nThis error most likely happened because the program could not find the JavaGUI.jar. Exiting.");
        process.exit(1);
    });
    
}

exports.newMessage = function(title, link){
    
    if (title === "") title = "empty_title";
    if (link === "") link = "empty_link";
    
    child.stdin.write( title + ',' + link + ',' );
}