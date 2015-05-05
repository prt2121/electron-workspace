var angular = require('angular');

angular.module('myApp', [])
.controller('MyController', ['$scope', function ($scope) {
  $scope.greetMe = 'World';
}]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ['myApp']);
});
