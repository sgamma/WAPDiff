'use strict';
var express         = require("express"),
    compression     = require('compression'),
    responseTime    = require('response-time'),
    errorhandler    = require('errorhandler'),
    _               = require('lodash'),
    loki            = require('lokijs'),
    fileutils       = require("./lib/fileutils"),
    config          = require('./config.isitel');

var app = express();
app.use(compression({threshold: 512}));
app.use(responseTime());
app.set('views', './views');
app.set('view engine', 'jade');
app.set('port', config.web.port || 3000);
app.use(express.static(__dirname + '/public'));

var server = app.listen(app.get('port'), function() {
    console.log("server listening on " + app.get('port'));
});

function getStats(path, regEx) {
    var fUtils = fileutils();
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
    global.db = new loki();
    global.mainfiles = global.db.addCollection('mainfiles', ['name']);
    global.files = global.db.addCollection('files', ['repository', 'name']);

    var regEx = config.mainRepository.regEx;
    var vssStats = getStats(config.mainRepository.path, regEx);
    vssStats.forEach(function(s, index, array) {
        s.repository = config.mainRepository.name;
        s.path = config.mainRepository.path;
        s.backup = config.mainRepository.backup;
        global.mainfiles.insert(s);
    });

    config.repositories.forEach(function(rep, index, array) {
        var s = getStats(rep.path, regEx);
        s.forEach(function(stat, index, array){
            stat.repository = rep.name;
            stat.path = rep.path;
            global.files.insert(stat);
        });
    });

    var model = {
        mainrep: config.mainRepository.name,
        mainpath: config.mainRepository.path,
        mainfiles: global.mainfiles.chain().simplesort('name').data(),
        reps: _.pluck(config.repositories, 'name'),
        repspath: _.pluck(config.repositories, 'path'),
        files: global.files
    };

    //var test = global.files.chain().find({'repository': '84'}).find({'name': 'bonecp-0.7.1.RELEASE.jar'}).data()[0];
    //res.send(test);
    res.render('files2', model);
});

app.post('/sync/:fid/:mfid', function (req, res) {

    var msg = 'sync file ' + req.params.fid + ' with mainfile ' + req.params.mfid;
    console.log(msg);
    var mfile = global.mainfiles.get(req.params.mfid);
    console.log(mfile);

    /*
    console.log('mfiles: ' + mfile);
    var file = global.files.get(req.params.fid);
    console.log('file: ' + file);
    console.log("Fare backup di " + file.path + file.name + " in " + file.backup);
    console.log("Copiare " + mfile.path + mfile.name + " in " + file.path);
    if ( mfile && file ) {
        console.log("Fare backup di " + file.path + file.name + " in " + file.backup);
        console.log("Copiare " + mfile.path + mfile.name + " in " + file.path);
    } else {
        console.log("Errore file non torvati!");
    }
    */
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

