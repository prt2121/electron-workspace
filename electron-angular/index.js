var angular = require('angular');
var angularMaterial = require('angular-material');
var angularAnimate = require('angular-animate');
var angularAria = require('angular-aria');

angular.module('myApp', ['ngMaterial', 'ngAnimate', 'ngAria'])
.config(function($mdThemingProvider) { $mdThemingProvider.theme('indigo').dark();})
.controller('MyController', ['$scope', function ($scope) {
  $scope.name = '';
  // $scope.greetMe = 'World';
  // if($scope.name) {
  //   $scope.greetMe = $scope.name;
  // }
}]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ['myApp']);
});
