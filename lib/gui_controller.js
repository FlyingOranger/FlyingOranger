var spawn = require('child_process').spawn,
    execFile = require('child_process').execFile,
    exec = require('child_process').exec,
    opener = require('./opener'),
    fsHelper = require('./fs_helper'),
    fs = require('fs'),
    startupManager = require('./startup_manager'),
    appManager = require('./apps_manager');


/* This module handles all creation and communication between this node.js application
* and the JavaGUI application */

var child = null;

/* creates our JavaGUI as a seperate process and controls stdin and stderr of the application
* Also catches all errors */
exports.create = function(){
    
    // create the java process as a detached process
    child = spawn('java', ['-jar', fsHelper.getFullPath('./JavaGUI.jar')], { detached: true });
    
    // record its PID in our file
    var pidsPath = fsHelper.getFullPath('./pids');
    var pids = fs.readFileSync( pidsPath, "utf8");
    pids += " " + child.pid;
    fs.writeFileSync( pidsPath, pids);
    
    // send all config to Java program... this is because I'm lazy and don't want to load
    // them myself in the java program
    var settings = appManager.appInfo.settings;
    child.stdin.write("CONFIG,run_on_startup," + startupManager.getState() + ",");
    child.stdin.write("CONFIG,disable_all_flying_notifications," + (settings.disable_all_flying_notifications ? "true": "false") + ",");
    for (var appName in appManager.appInfo.apps){
        child.stdin.write("CONFIG,create_app," + appName + ",");
        var app = settings.app_specific[appName];
        for (var app_specific_name in app)
            child.stdin.write("CONFIG,app_config," + appName + "," + app_specific_name + "," + (app[app_specific_name] ? "true": "false") + ",");
    }
    
    // handle responses from the child
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
            
            else if (parts[0] === "CONFIG"){
                    
                if (parts[1] === "run_on_startup" && parts.length === 4)
                    startupManager.setState( parts[2] === "true" ? true: false );
                
                else if (parts[1] === "disable_all_flying_notifications" && parts.length === 4)
                    appManager.appInfo.settings[ parts[1] ] = parts[2] === "true" ? true: false;
                
                
                else if (parts[1] === "app_config" && parts.length === 6){
                    appManager.appInfo.settings.app_specific[ parts[2] ][ parts[3] ] = parts[4] === "true" ? true: false;
                    
                    if (parts[3] === "Disable completely"){
                        
                        if ( parts[4] === "true" )
                            appManager.stopApp( parts[2] );
                        else
                            appManager.startApp( parts[2] );
                        
                    }
                    
                } else
                    reset = false;
                
                fsHelper.writeFile("./Notification_Apps/settings.json", appManager.appInfo.settings);
                
            } else if (parts[0] === "LINK"){ 
            
                if (parts[1] === "edit_apps")
                    opener( fsHelper.getFullPath("./Notification_Apps/"));
                                                 
                else opener(parts[1]);
                
            } else 
                reset = false;
            
            if (reset)
                message = "";
        }
    });
      
    // error handling... this one happens if the user doesn't have java or it's not in their path
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

/* Send a notification to our JavaGUI */
exports.newMessage = function(title, link, willFly){
    
    if (title === ""  || link === "") 
        console.error(" gui_controller.newMessage was called without a title or link ")
    
    else child.stdin.write("LINK," + title + ',' + link + ',' + (willFly === false ? false: true) + ',' );
}