var angular = require('angular');
var angularMaterial = require('angular-material');
var angularAnimate = require('angular-animate');
var angularAria = require('angular-aria');
var Promise = require('bluebird');
var adb = require('adbkit');
var fs = require('fs');
var StreamPng = require('StreamPng');
var client = adb.createClient();
var moment = require('moment');

angular.module('snapperApp', ['ngMaterial', 'ngAnimate', 'ngAria'])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
  .primaryPalette('blue')
  .accentPalette('red')
  .dark();
})
.controller('AppCtrl', ['$scope', '$timeout', '$mdBottomSheet', function ($scope, $timeout, $mdBottomSheet) {

  $scope.targetDevice = '';
  $scope.switch = '';
  $scope.recording = false;

  $scope.isVid = function() {
    return $scope.switch.case == 'vid';
  }

  $scope.screenCapture = function() {
    if ($scope.targetDevice && $scope.targetDevice.length) {
      screencap($scope.targetDevice);
    }
  }

  $scope.toggleRecording = function() {
    if($scope.recording) {
      $scope.stopRecord();
    } else {
      $scope.screenrecord();
    }
  }

  $scope.screenrecord = function() {
    if ($scope.targetDevice && $scope.targetDevice.length) {
      screenrecord($scope.targetDevice);
      $scope.recording = true;
    }
  }

  $scope.stopRecord = function() {
    if ($scope.targetDevice && $scope.targetDevice.length) {
      stopAndPull($scope.targetDevice);
      $scope.recording = false;
    }
  }

  $scope.showListBottomSheet = function($event) {
    $scope.alert = '';
    $mdBottomSheet.show({
      templateUrl: 'bottom-sheet-list-template.html',
      controller: 'ListBottomSheetCtrl',
      targetEvent: $event
    }).then(function(clickedItem) {
      if(clickedItem !== 'no device') {
        console.log(clickedItem + ' clicked!');
        $scope.targetDevice = clickedItem;
      }
    });
  };

}])
.controller('ListBottomSheetCtrl', function($scope, $mdBottomSheet) {

  $scope.items = [];

  client.listDevices()
  .map(function(device) { $scope.items.push(device); });

  $scope.listItemClick = function($index) {
    var clickedItem = $scope.items[$index].id;
    $mdBottomSheet.hide(clickedItem);
  };

  $scope.hide = function() {
    $mdBottomSheet.hide('no device');
  };

  $scope.isNoDevice = function() {
    return $scope.items.length === 0;
  }

});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['snapperApp']);
});

function stopAndPull(serial) {
  client.listDevices()
  .filter(function(device) { return isTargetDevice(device, serial) })
  .get(0)
  .then(function(device) { return client.shell(device.id, "ps  | grep screenrecord | awk '{print $2}'") })
  //.then(streamToPromise)
  .then(adb.util.readAll)
  .then(function(output) {
    run(serial, 'kill -2 ' + output.toString().trim());
    // TODO
    setTimeout(function (){
      pull(serial, '/sdcard/tmp.mp4');
    }, 200);
  })
  .catch(function(err) { console.error('Something went wrong:' + err.message) });
}

function screencap(serial) {
  mkdirIfNotExist('./snapperFiles/', 0744, function(err) {
    if(err) {
      console.log("Can't create a directory.");
    } else {
      var fileName = moment().format('[screencapture-]MMDDYY-hhmmss[.png]');
      client.screencap(serial)
      .then(function(pngStream) {
        var outfile = fs.createWriteStream('./snapperFiles/' + fileName);
        var png = StreamPng(pngStream);
        png.out().pipe(outfile);
      })
      .then(function() { console.log('Done!') })
      .catch(function(err) { console.error('Something went wrong: ' + err.message) })
    }
  });
}

function pull(serial, path) {
  client.listDevices()
  .filter(function(device) { return isTargetDevice(device, serial) })
  .get(0)
  .then(function(device) {
    if(typeof device != 'undefined') {
      mkdirIfNotExist('./snapperFiles', 0744, function(err) {
        if (err) {
          console.log("Can't create a directory.");
        } else {
          var fileName = moment().format('[screenrecord-]MMDDYY-hhmmss[.mp4]');
          client.pull(serial, path)
          .then(function(transfer) {
            return new Promise(function(resolve, reject) {
              var fn = './snapperFiles/' + fileName;
              transfer.on('progress', function(stats) {
                console.log(stats.bytesTransferred + ' bytes so far')
              })
              transfer.on('end', function() {
                console.log('Pull complete')
                resolve(serial)
              })
              transfer.on('error', reject)
              transfer.pipe(fs.createWriteStream(fn))
            })
          })
          .then(function(serial) {
            setTimeout(function (){
              run(serial, 'rm -f ' + path);
            }, 1000);
          });
        }
      });
    }
  });
}

function screenrecord(serial) {
  run(serial, "screenrecord /sdcard/tmp.mp4")
}

function run(serial, script) {
  return client.listDevices()
  .filter(function(device) { return isTargetDevice(device, serial) })
  .get(0)
  .then(function(device) { return client.shell(device.id, script) })
  //.then(streamToPromise)
  .then(adb.util.readAll)
  .then(function(output) { console.log(output.toString().trim()) })
  .catch(function(err) { console.error('Something went wrong:' + err.message) })
}

function streamToPromise(stream) {
  return new Promise(function(resolve, reject) {
    stream.on('data', function(chunk) { console.log(chunk.toString().trim()); });
    stream.on("end", resolve);
    stream.on("error", reject);
  });
}

function isTargetDevice(device, serial) {
  return device.id === serial
}

function mkdirIfNotExist(path, mask, cb) {
  if (typeof mask == 'function') {
    cb = mask;
    mask = 0777;
  }
  fs.mkdir(path, mask, function(err) {
    if (err) {
      if (err.code == 'EEXIST') cb(null);
      else cb(err);
    } else cb(null);
  });
}
