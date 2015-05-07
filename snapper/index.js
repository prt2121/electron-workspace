var angular = require('angular');
var angularMaterial = require('angular-material');
var angularAnimate = require('angular-animate');
var angularAria = require('angular-aria');

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
      console.log(clickedItem.name + ' clicked!')
    });
  };
}])
.controller('ListBottomSheetCtrl', function($scope, $mdBottomSheet) {
  $scope.items = [
    { name: 'XXX1' },
    { name: 'XXX2' },
    { name: 'XXX3' },
    { name: 'XXX4' },
  ];
  $scope.listItemClick = function($index) {
    var clickedItem = $scope.items[$index];
    $mdBottomSheet.hide(clickedItem);
  };
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['snapperApp']);
});
