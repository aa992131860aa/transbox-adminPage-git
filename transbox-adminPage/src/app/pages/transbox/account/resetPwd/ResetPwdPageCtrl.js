(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.account.resetPwd')
        .controller('ResetPwdPageCtrl', ResetPwdPageCtrl);

    function ResetPwdPageCtrl($scope, $filter, editableOptions, editableThemes, Http, Config) {
    	$scope.data = {
			transfers: [],
            pagination: {
                currentPage: 1,
                previousText: '上一页',
                nextText: '下一页'
            },
		}
		
        //get all transfers that status is not 'done'
		$scope.getAllTransfers = function() {
            var params = {
                type: 'transfering'
            }
			Http.get(Config.apiPath.transfers, params).then(function (data){
                console.log(data);
                $scope.data.transfers = data;

            },function(msg){
                console.log(msg);
            });
		}
		$scope.getAllTransfers();
    }

})();
