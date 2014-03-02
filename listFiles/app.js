(function() {
    'use strict';

    var fs = require('fs');
    var path = require('path');

    var musicFolder = process.argv[2];

    var processFileOrFolder = function(fileOrFolderName) {
        fs.stat(fileOrFolderName, function(err, stat) {
            if (err) throw err;

            if (stat.isFile()) {
                if (path.extname(fileOrFolderName) === '.flac') {
                    // TODO: get metadata
                    console.log(fileOrFolderName);
                    process.exit();
                }
            } else if (stat.isDirectory()) {
                list(fileOrFolderName);
            } else {
                throw "unknown file system thing: " + fileOrFolderName;
            }
        });
    };

    var list = function(folderPath) {
        fs.readdir(folderPath, function(err, files) {
            if (err) throw err;

            files.forEach(function(file) {
                processFileOrFolder(path.join(folderPath, file));
            });
        });
    };

    list(musicFolder);
})();