var spawn = require('child_process').spawn,
    execFile = require('child_process').execFile,
    exec = require('child_process').exec,
    opener = require('./opener'),
    fsHelper = require('./fs_helper'),
    fs = require('fs'),
    startupManager = require('./startup_manager');

var child = null;


exports.create = function(){
    
    // create the java process as a detached process
    child = spawn('java', ['-jar', fsHelper.getFullPath('./JavaGUI/JavaGUI.jar')], { detached: true });
    
    // record its PID in our file
    var pidsPath = fsHelper.getFullPath('./pids');
    var pids = fs.readFileSync( pidsPath, "utf8");
    pids += " " + child.pid;
    fs.writeFileSync( pidsPath, pids);
    
    // send all config to Java program... this is because I'm lazy and don't want to load
    // them myself in the java program
    child.stdin.write("CONFIG,run_on_startup," + startupManager.getState() + ",");
    
    // handle responses from the child... probably should put this in its own file
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
      
    // error handling... this one happens if the use doesn't have java or it's not in their path
    child.on('error', err => {
        
        console.error("Could not start the java program.\nThis either happened because Java is not installed on your computer.\nor\nBecause the 'java' keyword is not in your PATH.\nProgram will now exit");
        process.exit(1);
    });
    
    // this happens if the program can't find the JavaGUI jar, but we have java on the computer
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