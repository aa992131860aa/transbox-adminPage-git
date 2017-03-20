(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.database.box', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('box', {
                url: '/box',
                templateUrl: 'app/pages/transbox/database/box/box.html',
                title: '设备管理',
                controller: 'BoxPageCtrl'
            });
    }

})();