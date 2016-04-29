var fs = require('fs'),
    path = require('path');

exports.writeFile = function( relativePath, data ){
    
    var mainDir = path.dirname(require.main.filename);
    var filePath = path.resolve( mainDir, relativePath);
    
    fs.writeFileSync( filePath, JSON.stringify(data, null, '\t'));
    
}

exports.getFullPath = function( relativePath ){
    var mainDir = path.dirname(require.main.filename);
    var filePath = path.resolve( mainDir, relativePath);
    
    return filePath;
}