(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.database.hospital', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('hospital', {
                url: '/hospital',
                templateUrl: 'app/pages/transbox/database/hospital/hospital.html',
                title: '医院管理',
                controller: 'HospitalPageCtrl'
            });
    }

})();