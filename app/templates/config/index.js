var fs = require('fs');
var path = require('path');

var config = {};
var files = fs.readdirSync(__dirname);

files.filter(function (filename) {
  return path.extname(filename) === '.json';
}).forEach(function(filename) {
  var name = path.basename(filename, '.json');
  config[name] = require(path.join(__dirname, filename));
});

module.exports = config;