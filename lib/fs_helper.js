var fs = require('fs'),
    path = require('path');

exports.writeFile = function( relativePath, data ){
    
    var filePath = exports.getFullPath( relativePath );
    
    fs.writeFileSync( filePath, JSON.stringify(data, null, '\t'));
    
}

exports.readFile = function( relativePath ){
    
    var filePath = exports.getFullPath( relativePath );
    return fs.readFileSync( filePath, 'utf8' );
    
}

exports.getFullPath = function( relativePath ){
    
    var mainDir = path.join( __dirname, "../..");
    var filePath = path.join( mainDir, relativePath);
    
    return filePath;
}