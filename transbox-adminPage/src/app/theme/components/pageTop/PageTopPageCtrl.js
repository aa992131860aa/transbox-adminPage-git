(function() {
  'use strict';

  angular.module('BlurAdmin.theme.components.pageTop', ['ConfigFactory', 'HttpService'])
    .controller('PageTopPageCtrl', PageTopPageCtrl);

  /** @ngInject */
  function PageTopPageCtrl($scope, $window, Config, Http) {

    var today = new Date();
    $scope.data = {
      userInfo: Config.userInfo,
      today: Config.getDateStringFromObject(today),
    }

    $scope.logout = function() {
      Config.removeCookie('apple');
      Config.removeCookie('type');
      $window.location.href = 'auth.html';
    };

    $scope.editPwd = function () {
      $window.location.href = 'pwd.html';
    };

    // $scope.getUserInfo = function() {
    //   var apple = Config.getCookie('apple');
    //   Http.get(Config.apiPath.account + '/' + apple, {}).then(function(data) {
    //     $scope.data.userInfo = Config.userInfo;
    //     console.log($scope.data.userInfo);

    //   }, function(msg) {

    //   });
    // }

    // $scope.getUserInfo();
  }

})();