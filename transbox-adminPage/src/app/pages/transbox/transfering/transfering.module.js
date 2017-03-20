(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.transfering', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('transfering', {
                url: '/transfering',
                templateUrl: 'app/pages/transbox/transfering/transfering.html',
                title: '转运实时监控',
                controller: 'TransferingPageCtrl'
            });
    }

})();
