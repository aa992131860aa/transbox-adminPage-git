(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.account.resetPwd', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('resetPwd', {
                url: '/resetPwd',
                templateUrl: 'app/pages/transbox/resetPwd/resetPwd.html',
                title: '转运单监控',
                controller: 'LoginPageCtrl'
            });
    }

})();