(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.database.fitting')
        .controller('FittingPageCtrl', FittingPageCtrl)
        .controller('FittingModalCtrl', FittingModalCtrl);

    function FittingPageCtrl($scope, $filter, editableOptions, editableThemes, Http, Config, $uibModal, toastr, toastrConfig) {
    	var defaultConfig = angular.copy(toastrConfig);
        $scope.types = ['success', 'error', 'info', 'warning'];
        var openedToasts = [];
        $scope.options = {
            autoDismiss: false,
            positionClass: 'toast-top-right',
            type: 'error',
            timeOut: '5000',
            extendedTimeOut: '2000',
            allowHtml: false,
            closeButton: false,
            tapToDismiss: true,
            progressBar: false,
            newestOnTop: true,
            maxOpened: 0,
            preventDuplicates: false,
            preventOpenDuplicates: false,
            title: "保存失败",
            msg: "请正确填写所有医院信息"
        };

        $scope.openToast = function(type, title, msg, duration) {
            if (!type || !title || !msg) {
                return;
            }

            $scope.options.type = type;
            $scope.options.title = title;
            $scope.options.msg = msg;
            $scope.options.timeOut = duration ? duration : '3000';

            angular.extend(toastrConfig, $scope.options);
            openedToasts.push(toastr[$scope.options.type]($scope.options.msg, $scope.options.title));
            var strOptions = {};
            for (var o in $scope.options)
                if (o != 'msg' && o != 'title') strOptions[o] = $scope.options[o];
            $scope.optionsStr = "toastr." + $scope.options.type + "(\'" + $scope.options.msg + "\', \'" + $scope.options.title + "\', " + JSON.stringify(strOptions, null, 2) + ")";
        };

        $scope.$on('$destroy', function iVeBeenDismissed() {
            angular.extend(toastrConfig, defaultConfig);
        });

        var searchStatusOptions = ['全部'];
        for (var i = 0; i < Config.keyword.fittingStatus.length; i ++) {
            searchStatusOptions.push(Config.keyword.fittingStatus[i]);
        }
        $scope.data = {
            pageData: {
                totalItems: 0,
                fittings: [],
                displayedPages: 0
            },
            pagination: {
                currentPage: 1,
                maxSize: 20,
                previousText: '上一页',
                nextText: '下一页',
                isLoading: true
            },
            selectAll: false,
            detailModal: {},
            selectedFitting: {},
            searchOptions: {
                model: '',
                status: '全部',
                searchStatusOptions: searchStatusOptions
            },
            newFitting: {
                model: '',
                status: '',
                buyFrom: '',
                buyAt: '',
                remark: '',
                quantity: 1,
                storeDate: '',
                fittingNumber :''
            },
            statusOptions: Config.keyword.fittingStatus,
            newDate: {
                options: {
                    formatYear: 'yyyy',
                    startingDay: 1,
                    showWeeks: false,
                    language: 'zh-CN',
                },
                isOpen: false,
                altInputFormats: ['yyyy-MM-dd'],
                format: 'yyyy-MM-dd',
                modelOptions: {
                    timezone: 'Asia/beijing'
                }
            },
            newDate2: {
                options: {
                    formatYear: 'yyyy',
                    startingDay: 1,
                    showWeeks: false,
                    language: 'zh-CN',
                },
                isOpen: false,
                altInputFormats: ['yyyy-MM-dd'],
                format: 'yyyy-MM-dd',
                modelOptions: {
                    timezone: 'Asia/beijing'
                }
            },
            detailDate: {
                options: {
                    formatYear: 'yyyy',
                    startingDay: 1,
                    showWeeks: false,
                    language: 'zh-CN',
                },
                isOpen: false,
                altInputFormats: ['yyyy-MM-dd'],
                format: 'yyyy-MM-dd',
                modelOptions: {
                    timezone: 'Asia/beijing'
                }
            },
            detailDate2: {
                options: {
                    formatYear: 'yyyy',
                    startingDay: 1,
                    showWeeks: false,
                    language: 'zh-CN',
                },
                isOpen: false,
                altInputFormats: ['yyyy-MM-dd'],
                format: 'yyyy-MM-dd',
                modelOptions: {
                    timezone: 'Asia/beijing'
                }
            },
        }

        $scope.pickSearchStatus = function(index, title) {
            $scope.data.searchOptions.status = title;
        }

        $scope.toggleNewDatepicker = function() {
            $scope.data.newDate.isOpen = !$scope.data.newDate.isOpen;
        }

        $scope.toggleNewDatepicker2 = function() {
            $scope.data.newDate2.isOpen = !$scope.data.newDate2.isOpen;
        }

        $scope.toggleDetailDatepicker = function() {
            $scope.data.detailDate.isOpen = !$scope.data.detailDate.isOpen;
        }

        $scope.toggleDetailDatepicker2 = function() {
            $scope.data.detailDate2.isOpen = !$scope.data.detailDate2.isOpen;
        }

        // $scope.getDateString = function(obj) {
        //     return Config.getDateStringFromObject(obj);
        // }

        $scope.getShowDate = function (date) {
            if(date){
                return moment(date).format('YYYY-MM-DD');
            }
        };

        //get all transfers that status is not 'done'
        $scope.getFittings = function(tableState) {
            if (!tableState) {
                return;
            }

            console.log(999);
            $scope.data.selectAll = false;
            $scope.data.pagination.isLoading = true;
            var pagination = tableState.pagination;
            var start = pagination.start || 0;
            // This is NOT the page number, but the index of item in the list that you want to use to display the table.
            var number = pagination.number || $scope.data.pagination.maxSize;
            // Number of entries showed per page.

            var params = {
                start: start,
                number: number
            }

            if (!$.isEmptyObject($scope.data.searchOptions.model)) {
                params.model = $scope.data.searchOptions.model
            }

            if (!$.isEmptyObject($scope.data.searchOptions.status) && $scope.data.searchOptions.status !== '全部') {
                params.status = $scope.data.searchOptions.status;
            }

            // if (!$.isEmptyObject($scope.data.searchOptions.address)) {
            //     params.address = $scope.data.searchOptions.address
            // }

            Http.get(Config.apiPath.fittings, params).then(function(data) {
                $scope.data.pageData = data;
                tableState.pagination.numberOfPages = data.numberOfPages;
                $scope.data.pageData.displayedPages = Math.ceil(parseFloat(data.totalItems) / parseInt(data.numberOfPages));
                $scope.data.pageData.tableState = tableState;
                $scope.data.pagination.isLoading = false;

            }, function(msg) {
                console.log(msg);
            });
        }

        $scope.refreshTable = function() {
            console.log(888);
            if (parseInt($scope.data.pageData.numberOfPages) <= 1 && $scope.data.pageData.tableState) {
                $scope.getFittings($scope.data.pageData.tableState);

            } else {
                angular
                    .element('#fittingTablePagination')
                    .isolateScope()
                    .selectPage(1);
            }
        }

        $scope.searchFittings = function() {
            $scope.refreshTable();
        }

        $scope.switchSelectAll = function() {
            $scope.data.selectAll = !$scope.data.selectAll;

            if ($scope.data.selectAll) {
                for (var i = 0; i < $scope.data.pageData.fittings.length; i++) {
                    $scope.data.pageData.fittings[i].checked = true;
                }

            } else {
                for (var i = 0; i < $scope.data.pageData.fittings.length; i++) {
                    $scope.data.pageData.fittings[i].checked = false;
                }
            }
        }

        $scope.checkFitting = function(event, index) {
            event.stopPropagation();
        }

        /* ================= create a new fitting begin  ================= */
        $scope.initNewFittingParams = function() {
            $scope.data.newFitting = {
                model: '',
                status: '',
                buyFrom: '',
                buyAt: '',
                remark: '',
                quantity: 0,
                storeDate:'',
                fittingNumber :''
            }
        }

        $scope.openNewModal = function() {
            var options = {
                animation: true,
                templateUrl: 'app/pages/transbox/database/fitting/modal/new.html',
                size: 'lg',
                controller: 'FittingModalCtrl',
                controllerAs: 'NewModalCtrl',
                bindToController: true,
                scope: $scope,
                backdrop: 'static',
                windowTopClass: 'transfer-modal-top-class'
            }
            $scope.data.newModal = $uibModal.open(options);

            $scope.data.newModal.closed.then(function() {
                console.log('modal is closed.');
                console.log($scope.data.newFitting);
            });
        }

        $scope.pickNewFittingStatus = function(index, title) {
            $scope.data.newFitting.status = title;
        }

        $scope.isNewFittingParamsCorrect = function() {
            var fitting = $scope.data.newFitting;
            console.log(fitting);
            //|| $.isEmptyObject(fitting.buyFrom)
            if ($.isEmptyObject(fitting.model) || $.isEmptyObject(fitting.status) || $.isEmptyObject(fitting.fittingNumber)) {
                return false;
            }

            if (parseInt(fitting.quantity) <= 0) {
                return false;
            }

            // if (!Config.getFormatStringFromDate(fitting.buyAt)) {
            //     return false;
            // }

            if(!fitting.storeDate){
                return false;
            }

            return true;
        }

        $scope.createNewFitting = function() {
            if (!$scope.isNewFittingParamsCorrect()) {
                $scope.openToast('warning', '温馨提示', '请正确填写所有配件信息');
                return;
            }

            var fitting = {
                model: $scope.data.newFitting.model,
                quantity: $scope.data.newFitting.quantity,
                storeDate:moment($scope.data.newFitting.storeDate).format('YYYY-MM-DD HH:mm:ss'),
                status: $scope.data.newFitting.status,
                fittingNumber:$scope.data.newFitting.fittingNumber,
            };

            if (!$.isEmptyObject($scope.data.newFitting.remark)) {
                fitting.remark = $scope.data.newFitting.remark;
            }
            if (!$.isEmptyObject($scope.data.newFitting.buyFrom)) {
                fitting.buyFrom = $scope.data.newFitting.buyFrom;
            }
            if ($scope.data.newFitting.buyAt) {
                fitting.buyAt = moment($scope.data.newFitting.buyAt).format('YYYY-MM-DD HH:mm:ss');
            }

            console.log('fitting:'+JSON.stringify(fitting));

            Http.post(Config.apiPath.fitting, fitting).then(function(data) {
                $scope.openToast('success', '创建成功', '您已成功创建一个配件');
                $scope.initNewFittingParams();
                $scope.closeNewModal();
                $scope.refreshTable();

            }, function(msg) {
                $scope.openToast('error', '创建失败', msg);
            });
        }

        $scope.closeNewModal = function() {
                $scope.data.newModal.close();
            }
            /* ================= create a new fitting end  ================= */



            /* ================= update fitting begin  ================= */
        $scope.pickFitting = function(fitting) {
            $scope.data.selectedFitting = angular.copy(fitting);
            // 入库时间是必选的
            $scope.data.selectedFitting.storeDate =  new Date(moment($scope.data.selectedFitting.storeDate).format('YYYY-MM-DD'));
            // 购买时间可选的
            if ($scope.data.selectedFitting.buyAt) {
                $scope.data.selectedFitting.buyAt = new Date(moment($scope.data.selectedFitting.buyAt).format('YYYY-MM-DD'));
            };

            $scope.openDetailModal();
        };

        $scope.openDetailModal = function() {
            var options = {
                animation: true,
                templateUrl: 'app/pages/transbox/database/fitting/modal/detail.html',
                size: 'lg',
                controller: 'FittingModalCtrl',
                controllerAs: 'DetailModalCtrl',
                bindToController: true,
                scope: $scope,
                backdrop: 'static',
                windowTopClass: 'transfer-modal-top-class'
            }
            $scope.data.detailModal = $uibModal.open(options);

            $scope.data.detailModal.closed.then(function() {
                console.log('modal is closed.');
                console.log($scope.data.selectedFitting);
            });
        }

        $scope.pickDetailFittingStatus = function(index, title) {
            $scope.data.selectedFitting.status = title;
        }

        $scope.isDetailFittingParamsCorrect = function() {
            var fitting = $scope.data.selectedFitting;
            console.log(fitting);
            //|| $.isEmptyObject(fitting.buyFrom)
            if ($.isEmptyObject(fitting.model) || $.isEmptyObject(fitting.status) || $.isEmptyObject(fitting.fittingNumber)) {
                return false;
            }

            if (parseInt(fitting.quantity) <= 0) {
                return false;
            }

            // if (!Config.getFormatStringFromDate(fitting.buyAt)) {
            //     return false;
            // }

            if(!fitting.storeDate){
                return false;
            }

            return true;
        }

        $scope.saveDetailFittingInfo = function() {
            if (!$scope.isDetailFittingParamsCorrect()) {
                $scope.openToast('warning', '温馨提示', '请正确填写所有配件信息');
                return;
            }

            var fitting = {
                model: $scope.data.selectedFitting.model,
                quantity: $scope.data.selectedFitting.quantity,
                storeDate:moment($scope.data.selectedFitting.storeDate).format('YYYY-MM-DD HH:mm:ss'),
                status: $scope.data.selectedFitting.status,
                fittingNumber:$scope.data.selectedFitting.fittingNumber,
            };

            if (!$.isEmptyObject($scope.data.selectedFitting.remark)) {
                fitting.remark = $scope.data.selectedFitting.remark;
            }
            if (!$.isEmptyObject($scope.data.selectedFitting.buyFrom)) {
                fitting.buyFrom = $scope.data.selectedFitting.buyFrom;
            }
            if ($scope.data.selectedFitting.buyAt) {
                fitting.buyAt = moment($scope.data.selectedFitting.buyAt).format('YYYY-MM-DD HH:mm:ss');
            }

            Http.put(Config.apiPath.fitting + '/' + $scope.data.selectedFitting.fittingid, fitting).then(function(data) {
                $scope.openToast('success', '创建成功', '您已成功修改改配件信息');
                $scope.closeDetailModal();
                $scope.refreshTable();

            }, function(msg) {
                $scope.openToast('error', '保存失败', msg);
            });
        }

        $scope.closeDetailModal = function() {
                $scope.data.detailModal.close();
            }
            /* ================= update fitting end  ================= */

        $scope.propertyName = 'model';
        $scope.reverse = true;

        $scope.sortBy = function(propertyName) {
            $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
            $scope.propertyName = propertyName;
        };
    }



    // modal controller
    function FittingModalCtrl($scope) {
        console.log('fitting modal.....');
    }

})();
