(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.history', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('history', {
                url: '/history',
                templateUrl: 'app/pages/transbox/history/history.html',
                title: '转运历史查询',
                controller: 'HistoryPageCtrl'
            });
    }

})();