var angular = require('angular');
var angularMaterial = require('angular-material');
var angularAnimate = require('angular-animate');
var angularAria = require('angular-aria');
var Promise = require('bluebird');
var adb = require('adbkit');
var fs = require('fs');
var StreamPng = require('StreamPng');
var client = adb.createClient();

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

  $scope.isVid = function() {
    return $scope.switch.case == 'vid';
  }

  $scope.screenCapture = function() {
    if ($scope.targetDevice && $scope.targetDevice.length) {
      screencap($scope.targetDevice);
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

//run(clickedItem, "ls")
//screencap(clickedItem);
//adb shell screenrecord /sdcard/vid.mp4
//adb shell screencap -p /sdcard/screenshot.png
function screencap(serial) {
  client.screencap(serial)
  .then(function(pngStream) {
    var outfile = fs.createWriteStream('image.png');
    var png = StreamPng(pngStream);
    png.out().pipe(outfile);
  })
  .then(function() { console.log('Done!') })
  .catch(function(err) { console.error('Something went wrong: ' + err.message) })
}

function screenrecord(serial) {
  run(serial, "screenrecord /sdcard/tmp.mp4")
}

function run(serial, script) {
  client.listDevices()
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
