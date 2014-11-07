'use strict';
var express     = require("express"),
    //fs        = require("fs"),
    //moment    = require("moment"),
    _           = require('lodash'),
    fileutils   = require("./lib/fileutils");

var app = express();
app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));


var fUtils = fileutils();

var server = app.listen(3000, function(){
    console.log("server listening on 3000.");
});

function getStats(path, regEx) {
    var files = fUtils.files(path, regEx);
    var fStats = [];
    files.forEach(function(f, index, array) {
        if ( regEx.test(f) ) {
            fStats.push(fUtils.stat(path + f));
        }
    });
    return fStats;
}

app.get('/', function (req, res) {
    var regEx = /^.*\.jar$/;
    var vssPathIsitel = 'C:\\javalab\\VSS\\Javalab\\Distribution\\Isitel\\';
    //var vssPathAltri = 'C:\\javalab\\VSS\\Javalab\\Distribution\\Altri\\';
    var vssStats = getStats(vssPathIsitel, regEx);
    //vssStats = vssStats.concat(getStats(vssPathAltri, regEx));
    var _84Path = '\\\\10.30.254.84\\c$\\Javalab\\waportal\\WEB-INF\\lib\\';
    var _84Stats = getStats(_84Path, regEx);
    var _88WAPPath = '\\\\10.30.254.88\\c$\\Javalab\\waportal\\WEB-INF\\lib\\'
    var _88WAPStats = getStats(_88WAPPath, regEx);
    var _88PEMPath = '\\\\10.30.254.88\\c$\\Javalab\\wap-pem\\WEB-INF\\lib\\'
    var _88PEMStats = getStats(_88PEMPath, regEx);
    var lisaPath = '\\\\lisa\\LISA-D\\Javalab\\wap-test\\WEB-INF\\lib\\';
    var lisaStats = getStats(lisaPath, regEx);

    var mainFiles = [];
    var files = [];
    vssStats.forEach(function(s, index, array) {
        s.repository = 'VSS';
        mainFiles.push(s);
    });
    _84Stats.forEach(function(s, index, array) {
        s.repository = 'WAP.84';
        files.push(s);
    });
    _88WAPStats.forEach(function(s, index, array) {
        s.repository = 'WAP.88';
        files.push(s);
    });
    _88PEMStats.forEach(function(s, index, array) {
        s.repository = 'PEM.88';
        files.push(s);
    });
    lisaStats.forEach(function(s, index, array) {
        s.repository = 'LISA';
        files.push(s);
    });

    var model = {
        mainrep: 'VSS',
        mainfiles: _.sortBy(mainFiles, 'name'),
        reps: ['WAP.84', 'WAP.88', 'PEM.88', 'LISA'],
        files: _.groupBy(files, 'name'),
    };

    //res.send(model);
    res.render('files', model);
});

