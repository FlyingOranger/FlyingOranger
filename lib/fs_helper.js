var fs = require('fs'),
    path = require('path');

exports.writeFile = function( relativePath, data ){
    
    var mainDir = path.join( __dirname, "../..");
    var filePath = path.join( mainDir, relativePath);
    
    fs.writeFileSync( filePath, JSON.stringify(data, null, '\t'));
    
}

exports.getFullPath = function( relativePath ){
    
    var mainDir = path.join( __dirname, "../..");
    var filePath = path.join( mainDir, relativePath);
    
    return filePath;
}