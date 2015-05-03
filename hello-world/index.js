var $ = require('dombo')
var mkdirp = require('mkdirp').sync
var Rx = require('rx');
var input = $('#input');
var copy = document.querySelector('#copy-input');
var content = document.querySelector('#content-container');

$('#hello-button').on('click', function () {
  window.alert("hello, world!");
})

$('#foo-button').on('click', function () {
  mkdirp('./foo', function(err) {
    console.log(err);
  });
})

var keyups = Rx.Observable.fromEvent(input, 'keyup')
.map(function (e) {
  return e.target.value;
});

keyups.subscribe( function (data) {
  /* Do something with the data like binding */
  log(data);
}, function (error) {
  /* handle any errors */
  console.log(error);
});

function log(value){
  copy.value = value;
  content.innerHTML = value;
}
