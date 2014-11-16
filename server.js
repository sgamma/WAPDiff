'use strict';
var express         = require("express"),
    compression     = require('compression'),
    responseTime    = require('response-time'),
    errorhandler    = require('errorhandler'),
    bodyParser      = require('body-parser'),
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
        global.mainfiles.insert(s);
    });

    config.repositories.forEach(function(rep, index, array) {
        var s = getStats(rep.path, regEx);
        s.forEach(function(stat, index, array){
            stat.repository = rep.name;
            stat.path = rep.path;
            stat.backup = rep.backup;
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
    res.render('files', model);
});

app.post('/sync', function (req, res) {
    var fid = parseInt(req.body.fid,10);
    var mfid = parseInt(req.body.mfid,10);
    var mfile = global.mainfiles.get(mfid);
    var file = global.files.get(fid);
    if ( mfile && file ) {
        var fUtils = fileutils();
        var f = file.path + file.name;
        var mf = mfile.path + mfile.name;
        fUtils.backup(f, file.backup, function(err, done) {
            console.log("sync post - Dentro callback backup");
            if (err) {
                console.log('sync post - Errore nella callback backup');
                err.userMessage = 'sync post - Errore nel backup del file';
                res.send({
                        result: false,
                        error: err});
            } else if ( done ) {
                console.log('sync post - Backup fatto ... procedo con la copia');
                fUtils.copy(mf, file.path, function(err, done){
                    console.log("sync post - Dentro callback copia");
                    if (err) {
                        console.log('sync post - Errore nella copia file');
                        err.userMessage = 'Errore nella copia del file';
                        res.send({
                            result: false,
                            error: err});
                    } else if (done) {
                        console.log('sync post - Copia fatta mando ok');
                        res.json({
                                error: null,
                                result: true
                            });
                    }
                });
            }
        });
    } else {
        var e = new Error();
        e.userMessage = 'File non trovati';
        res.send({result: false,
                  error: e});
    }
});

app.get('*', function(req, res, next) {
    var err = new Error();
    err.status = 404;
    next(err);
})

// custom 404 page
app.use(function(err, req, res, next) {
    if(err.status !== 404) {
        return next();
    }
    res.type('text/plain');
    res.status(404);
    res.send(err.userMessage || '404 - Not Found');
});

app.use(function(err, req, res, next) {
    if(err.status === 500 && req.xhr) {
        res
            .status(500)
            .send({error: {
                    userMessage: err.userMessage || 'Errore imprevisto.'}
                });
    }
    return next();
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
