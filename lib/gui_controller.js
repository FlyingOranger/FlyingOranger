var spawn = require('child_process').spawn,
    execFile = require('child_process').execFile,
    opener = require('./opener'),
    fs = require('./fs_helper');

var child = null;


exports.create = function(){
    
    
    child = spawn('java', ['-jar', fs.getFullPath('JavaGUI.jar')], { detached: true });
    
    
    var link = "";
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
        
        link += chunk;
        if (link.charAt( link.length - 1) === ","){
            
            if (link.startsWith("EXIT"))
                process.exit(0);
            
            opener(link.substr(0, link.length - 1));
            link = "";
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