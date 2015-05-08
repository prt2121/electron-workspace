var angular = require('angular');
var angularMaterial = require('angular-material');
var angularAnimate = require('angular-animate');
var angularAria = require('angular-aria');
var Promise = require('bluebird');
var adb = require('adbkit');
var client = adb.createClient();

angular.module('snapperApp', ['ngMaterial', 'ngAnimate', 'ngAria'])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
  .primaryPalette('blue')
  .accentPalette('red')
  .dark();
})
.controller('AppCtrl', ['$scope', '$timeout', '$mdBottomSheet', function ($scope, $timeout, $mdBottomSheet) {
  $scope.showListBottomSheet = function($event) {
    $scope.alert = '';
    $mdBottomSheet.show({
      templateUrl: 'bottom-sheet-list-template.html',
      controller: 'ListBottomSheetCtrl',
      targetEvent: $event
    }).then(function(clickedItem) {
      console.log(clickedItem + ' clicked!')
      run(clickedItem, "ls")
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
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['snapperApp']);
});

function run(serial, script) {
  var x = client.listDevices()
  .filter(function(device) { return isTargetDevice(device, serial) })
  .get(0)
  .then(function(device) { return client.shell(device.id, script) })
  .then(streamToPromise)
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
