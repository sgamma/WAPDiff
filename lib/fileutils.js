'use strict';
var fs      = require('fs-extra'),
    _       = require('lodash'),
    moment  = require("moment");

module.exports = function() {
  //private
  function match(str, regEx) {
    return regEx.test(str);
  };

  function fileFromPath(path) {
    var regex = /[^\\]+$/;
    if ( path && regex.test(path) ) {
      return regex.exec(path)[0];
    }
  };

  function copytime(file, destFile) {
    var stat = fs.statSync(file);
    fs.chmodSync(destFile, stat.mode);
    fs.utimesSync(destFile, stat.atime, stat.mtime);
  };

  function bytesToSize(bytes) {
    if(bytes == 0) return '0 Byte';
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
  };

  return {
    //public
    files: function(path, regEx) {
      var fList = fs.readdirSync(path);
      if ( regEx ) {
        _.remove(fList, function(file) {
            !match(path, regEx)
        })
      }
      return fList;
    },
    stat: function(file) {
      var fStat = fs.statSync(file);
      return {
        name: fileFromPath(file),
        date: moment(fStat.mtime),
        prettydate: moment(fStat.mtime).format("DD/MM/YYYY HH:mm"),
        size: fStat.size,
        prettysize: bytesToSize(fStat.size)
      };
    },
    copy: function(file, toDir, cback) {
      if (toDir) {
        fs.ensureDirSync(toDir);
        if (file) {
          var f = fileFromPath(file);
          var destFile = toDir+f;
          console.log('futils - try to copy ' + file + ' in ' + destFile);
          fs.copy(file, destFile, function(err){
            if(err) {
              console.log('futils - got error coping file ' + err);
              cback(err, false);
            }
            copytime(file, destFile)
            cback(null, true);
          });
        }
      }
    },
    backup: function(file, toDir, cback) {
      if (toDir) {
        fs.ensureDirSync(toDir);
        if (file) {
          var f = fileFromPath(file);
          var destFile = toDir+f;
          fs.removeSync(destFile);
          fs.copy(file, destFile, function(err){
            if (err) {
              err.userMessage = 'Errore nella copia del file ' + file;
              cback(err, false);
            }
            copytime(file, destFile);
            cback(null, true);
          });
        }
      } else {
        var err = new Error();
        err.userMessage('futils.backup: parametro toDir non deve essere nullo');
        cback(err, false);
      }
    }
  };
}
