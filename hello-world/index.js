var $ = require('dombo')
var mkdirp = require('mkdirp').sync

$('#foo-button').on('click', function () {
  mkdirp('./foo', function(err) {
     console.log(err);
  });
})
