'use strict';

angular.module('BlurAdmin', [
  'ngAnimate',
  'ui.bootstrap',
  'ui.sortable',
  'ui.router',
  'ngTouch',
  'toastr',
  'smart-table',
  "xeditable",
  'ui.slimscroll',
  'ngJsTree',
  'angular-progress-button-styles',

  'BlurAdmin.theme',
  'BlurAdmin.pages',

  'ConfigFactory',     //add by blackmatch
  'HttpService',
])
.run(function(Config, Http, $window){
  Http.get(Config.apiPath.keywords, {}).then(function(data) {
    Config.keyword = data;
    console.log(Config.keyword);
    
  }, function(msg) {

  }); 

  //check use if login
  var apple = Config.getCookie('apple');
  if (!apple) {
    $window.location.href = 'auth.html';
  } else {
    Http.get(Config.apiPath.account + '/' + apple, {}).then(function(data) {
        // $scope.data.userInfo = Config.userInfo;
        console.log(data);
        Config.userInfo = data;

      }, function(msg) {

      });
  }

});