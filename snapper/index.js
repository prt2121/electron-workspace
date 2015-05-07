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
.controller('AppCtrl', ['$scope', function ($scope) {
  //
}]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ['snapperApp']);
});

//https://material.angularjs.org/#/demo/material.components.sidenav
