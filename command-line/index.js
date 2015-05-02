var $ = require('dombo')
var spawn = require('child_process').spawn;

$('#ls-button').on('click', function () {
  console.log('ls');
  list()
})

$('#run-button').on('click', function () {
  console.log('run');
  run_cmd( "adb", ["devices"], function(code) { console.log (code) });
})

function list() {
  ls = spawn('ls', ['-al', '.']);

  ls.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  ls.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  ls.on('close', function (code) {
    console.log('child process exited with code ' + code);
  });
}

function run_cmd(cmd, args, callBack ) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";

    child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    child.stdout.on('end', function() { callBack (resp) });
}
