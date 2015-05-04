var $ = require('dombo');
var spawn = require('child_process').spawn;
var Promise = require('bluebird');
var adb = require('adbkit');
var client = adb.createClient();
var fs = require('fs');
var StreamPng = require('StreamPng');
var serial = document.querySelector('#serial');
var command = document.querySelector('#command');

$('#ls-button').on('click', function () {
  console.log('ls');
  list()
})

$('#capture-button').on('click', function () {
  console.log('run ' + serial.value);
  screencap(serial.value);
})

$('#command-button').on('click', function () {
  //console.log('run ' + serial.value);
  //run(command.value);
  run2(serial.value, command.value);
})

function run2(serial, script) {
  var x = client.listDevices()
  .filter(function(device) { return isTargetDevice(device, serial) })
  .get(0)
  .then(function(device) { return client.shell(device.id, script) })
  .then(streamToPromise)
  //.then(adb.util.readAll)
  .then(function(output) { console.log(output.toString().trim()) })
  .catch(function(err) { console.error('Something went wrong:', err.stack) })
}

function streamToPromise(stream) {
  return new Promise(function(resolve, reject) {
    stream.on('data', function(chunk) { console.log('length ' + chunk.toString().trim()); });
    stream.on("end", resolve);
    stream.on("error", reject);
  });
}

function isTargetDevice(device, serial) {
  return device.id === serial
}

function run(script) {
  client.listDevices()
  .then(function(devices) {
    return Promise.map(devices, function(device) {
      return client.shell(device.id, script)
      .then(adb.util.readAll)
      .then(function(output) {
        console.log(device.id + " : " + output.toString().trim())
      })
    })
  })
  .then(function() {
    console.log('Done.')
  })
  .catch(function(err) {
    console.error('Something went wrong:', err.stack)
  })
}

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

function screencap(serial) {
  if ((!serial || !serial.length)) {
    client.listDevices()
    .then(function(devices) {
      return Promise.map(devices, function(device) {
        console.log('device.id ' + device.id)
        return capture(device.id)
      })
    })
    .then(function() {
      console.log('Done!')
    })
    .catch(function(err) {
      console.error('Something went wrong:', err.stack)
    })
  } else {
    capture(serial)
  }
}

function capture(serial) {
  client.screencap(serial)
  .then(function(pngStream) {
    var outfile = fs.createWriteStream('image.png');
    var png = StreamPng(pngStream);
    png.out().pipe(outfile);
  })
  .then(function() {
    console.log('Done!')
  })
  .catch(function(err) {
    console.error('Something went wrong:', err.stack)
  })
}

function listFiles() {
  client.listDevices()
  .then(function(devices) {
    return Promise.map(devices, function(device) {
      return client.readdir(device.id, '/sdcard')
      .then(function(files) {
        // Synchronous, so we don't have to care about returning at the
        // right time
        files.forEach(function(file) {
          if (file.isFile()) {
            console.log(device.id + ' Found file ' + file.name)
          }
        })
      })
    })
  })
  .then(function() {
    console.log('Done checking /sdcard files on connected devices')
  })
  .catch(function(err) {
    console.error('Something went wrong:', err.stack)
  })
}
