var Rx = require('rx');
var fs = require('fs');
var pathUtil = require('path');

function FileWithStats(file, stats) {
    this.file = file;
    this.stats = stats;
}

function getFilesInDirectoryObservable(path) {
    var filesInDirectory = Rx.Observable.create(function (observer) {
        fs.readdir(path, function(err, files) {
            if(err == null) {
                files.forEach(function(file) {
                    observer.onNext(file);
                });
            }
            observer.onCompleted();
        });
    });

    return filesInDirectory;
};

function getFileStatsObservable(file) {
    return Rx.Observable.create(function (observer) {
        fs.stat(file, function(error, stats) {
            if(error == null) {
                observer.onNext(new FileWithStats(file, stats));
            }
            observer.onCompleted();
        });
    });
}

function getFiles(path) {
    var filesInPath = getFilesInDirectoryObservable(path);
    
    var filesWithStats = filesInPath.flatMap(function (directoryItem) {
        return getFileStatsObservable(pathUtil.join(path, directoryItem));
    });

    var files = filesWithStats
        .filter(function(fileWithStats) { 
            return fileWithStats.stats.isFile(); })
        .map(function(fileWithStats) {
            return fileWithStats.file; });

    var directories = filesWithStats
        .filter(function(fileWithStats) {
            return fileWithStats.stats.isDirectory(); })
        .map(function(fileWithStats) {
            return pathUtil.join(path, fileWithStats.file); });
    
    return Rx.Observable.concat(
            files,
            directories.flatMap(function (directoryItem) {
                return getFiles(pathUtil.relative(path, directoryItem));
            }));
}

getFiles('C:\\').filter(function(x) { return x.indexOf("jpg") > 0; }).take(4).subscribe(console.log);
