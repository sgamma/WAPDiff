'use strict';
var express         = require("express"),
    compression     = require('compression'),
    responseTime    = require('response-time'),
    errorhandler    = require('errorhandler'),
    _               = require('lodash'),
    loki            = require('lokijs'),
    fileutils       = require("./lib/fileutils"),
    config          = require('./config');

var app = express();
app.use(compression({threshold: 512}));
app.use(responseTime());
app.set('views', './views');
app.set('view engine', 'jade');
app.set('port', config.web.port || 3000);
app.use(express.static(__dirname + '/public'));

var fUtils = fileutils();
var db = new loki('loki.json');
var mainfiles = db.addCollection('mainfiles', ['name']);
var files = db.addCollection('files', ['repository', 'name']);

var server = app.listen(app.get('port'), function() {
    console.log("server listening on " + app.get('port'));
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
    //var mainFiles = [];
    var regEx = config.mainRepository.regEx;
    var vssStats = getStats(config.mainRepository.path, regEx);
    vssStats.forEach(function(s, index, array) {
        s.repository = config.mainRepository.name;
        s.path = config.mainRepository.path;
        //mainFiles.push(s);
        mainfiles.insert(s);
    });

    //var files = [];
    config.repositories.forEach(function(rep, index, array) {
        var s = getStats(rep.path, regEx);
        s.forEach(function(stat, index, array){
            stat.repository = rep.name;
            stat.path = rep.path;
            //files.push(stat);
            files.insert(stat);
        });
    });

    var model = {
        mainrep: config.mainRepository.name,
        mainpath: config.mainRepository.path,
        //mainfiles: _.sortBy(mainFiles, 'name'),
        mainfiles: mainfiles.find(),
        reps: _.pluck(config.repositories, 'name'),
        repspath: _.pluck(config.repositories, 'path'),
        files: _.groupBy(files.data, 'name')
    };

    res.send(model);
    //res.render('files', model);
});

app.post('/sync/:rep/:filename', function (req, res) {
    var msg = 'sync file ' + req.params.filename + ' on repository ' + req.params.rep;
    console.log(msg);
    setTimeout(function(){
        res.send({error:'Errore imprevisto'});
    }, 2000);
});

// custom 404 page
app.use(function(req, res){
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

if ( 'development' == app.get('env') ) {
    app.use(errorhandler());
} else {
    // custom 500 page
    app.use(function(err, req, res, next){
        console.error(err.stack);
        res.type('text/plain');
        res.status(500);
        res.send('500 - Server Error');
    });
}

