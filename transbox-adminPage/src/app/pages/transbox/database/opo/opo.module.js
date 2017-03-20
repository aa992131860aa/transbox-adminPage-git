(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.database.opo', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('opo', {
                url: '/opo',
                templateUrl: 'app/pages/transbox/database/opo/opo.html',
                title: 'OPO管理',
                controller: 'OpoPageCtrl'
            });
    }

})();