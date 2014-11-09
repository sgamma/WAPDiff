'use strict';
var fs      = require('fs'),
    ncp     = require('ncp'),
    re      = require('rimraf'),
    _       = require('lodash'),
    moment  = require("moment");

module.exports = function() {
  //private
  function match(str, regEx) {
    return regEx.test(str);
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
        /*
        fList.forEach(function(f, index, array) {
            if( !match(path, regEx) ) array.splice(index, 1);
        });
        */
      }
      return fList;
    },
    stat: function(file) {
      var regEx = /[^\\]+$/;
      var fStat = fs.statSync(file);
      return {
        name: regEx.exec(file)[0],
        date: moment(fStat.mtime),
        prettydate: moment(fStat.mtime).format("DD/MM/YYYY HH:mm"),
        size: fStat.size,
        prettysize: bytesToSize(fStat.size)
      };
    }
  };
}
