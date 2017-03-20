(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.database.fitting', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('fitting', {
                url: '/fitting',
                templateUrl: 'app/pages/transbox/database/fitting/fitting.html',
                title: '配件管理',
                controller: 'FittingPageCtrl'
            });
    }

})();