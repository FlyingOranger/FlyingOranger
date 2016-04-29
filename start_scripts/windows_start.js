var spawn = require('child_process').spawn,
    path = require('path'),
    fs = require('fs');

var indexPath = path.join( __dirname, "/..", "index.js");
var logPath = path.join( __dirname, "/..", "log.txt");

var out = fs.openSync(logPath, 'a');
var err = fs.openSync(logPath, 'a');

var child = spawn('node', [ indexPath ], {
    detached: true,
    stdio: ['ignore', out, err]
});

child.unref();
process.exit(0);