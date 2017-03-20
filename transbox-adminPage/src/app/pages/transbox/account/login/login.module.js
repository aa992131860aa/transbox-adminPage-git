(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.account.login', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'app/pages/transbox/login/login.html',
                title: '转运单监控',
                controller: 'LoginPageCtrl'
            });
    }

})();