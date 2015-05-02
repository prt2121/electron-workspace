var $ = require('dombo')
var mkdirp = require('mkdirp').sync

$('#hello-button').on('click', function () {
  window.alert("hello, world!");
})

$('#foo-button').on('click', function () {
  mkdirp('./foo', function(err) {
     console.log(err);
  });
})
