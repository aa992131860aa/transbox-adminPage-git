(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.database.box')
        .controller('BoxPageCtrl', BoxPageCtrl)
        .controller('BoxModalCtrl', BoxModalCtrl);

    function BoxPageCtrl($scope, $filter, editableOptions, editableThemes, Http, Config, $uibModal, toastr, toastrConfig) {
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
        for (var i = 0; i < Config.keyword.boxStatus.length; i ++) {
            searchStatusOptions.push(Config.keyword.boxStatus[i]);
        }
        $scope.data = {
            pageData: {
                totalItems: 0,
                boxes: [],
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
            selectedBox: {},
            searchOptions: {
                model: '',
                deviceId: '',
                status: '全部',
                searchStatusOptions: searchStatusOptions
            },
            newBox: {
                model: '',
                status: '',
                buyFrom: '',
                buyAt: '',
                remark: '',
                deviceId: '',
                storeDate:''
            },
            statusOptions: Config.keyword.boxStatus,
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
            }

        }

        $scope.pickSearchStatus = function(index, title) {
            $scope.data.searchOptions.status = title;
        }

        $scope.toggleNewDatepicker = function() {
            $scope.data.newDate.isOpen = !$scope.data.newDate.isOpen;
        };

        $scope.toggleNewDatepicker2 = function() {
            $scope.data.newDate2.isOpen = !$scope.data.newDate2.isOpen;
        }

        $scope.toggleDetailDatepicker = function() {
            $scope.data.detailDate.isOpen = !$scope.data.detailDate.isOpen;
        };
        $scope.toggleDetailDatepicker2 = function() {
            $scope.data.detailDate2.isOpen = !$scope.data.detailDate2.isOpen;
        };

        // $scope.getDateString = function(obj) {
        //     return Config.getDateStringFromObject(obj);
        // };

        $scope.getShowDate = function (date) {
            if(date){
                return moment(date).format('YYYY-MM-DD');
            }
        };


        //get all transfers that status is not 'done'
		$scope.getBoxes = function(tableState) {
            if (!tableState) {
                return;
            }

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

            if (!$.isEmptyObject($scope.data.searchOptions.deviceId)) {
                params.deviceId = $scope.data.searchOptions.deviceId
            }

            if (!$.isEmptyObject($scope.data.searchOptions.status) && $scope.data.searchOptions.status !== '全部') {
                params.status = $scope.data.searchOptions.status
            }

            Http.get(Config.apiPath.boxes, params).then(function(data) {
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
            if (parseInt($scope.data.pageData.numberOfPages) <= 1 && $scope.data.pageData.tableState) {
                $scope.getBoxes($scope.data.pageData.tableState);

            } else {
                angular
                    .element('#boxTablePagination')
                    .isolateScope()
                    .selectPage(1);
            }
        }

        $scope.searchBoxes = function() {
            $scope.refreshTable();
        }

        $scope.switchSelectAll = function() {
            $scope.data.selectAll = !$scope.data.selectAll;

            if ($scope.data.selectAll) {
                for (var i = 0; i < $scope.data.pageData.boxes.length; i++) {
                    $scope.data.pageData.boxes[i].checked = true;
                }

            } else {
                for (var i = 0; i < $scope.data.pageData.boxes.length; i++) {
                    $scope.data.pageData.boxes[i].checked = false;
                }
            }
        }

        $scope.checkBox = function(event, index) {
            event.stopPropagation();
        }

        /* ================= create a new box begin  ================= */
        $scope.initNewBoxParams = function() {
            $scope.data.newBox = {
                model: '',
                deviceId: '',
                buyFrom: '',
                status: '',
                buyAt: '',
                remark: '',
                storeDate :''
            }
        }

        $scope.openNewModal = function() {
            var options = {
                animation: true,
                templateUrl: 'app/pages/transbox/database/box/modal/new.html',
                size: 'lg',
                controller: 'BoxModalCtrl',
                controllerAs: 'NewModalCtrl',
                bindToController: true,
                scope: $scope,
                backdrop: 'static',
                windowTopClass: 'transfer-modal-top-class'
            }
            $scope.data.newModal = $uibModal.open(options);

            $scope.data.newModal.closed.then(function() {
                console.log('modal is closed.');
                console.log($scope.data.newBox);
            });
        }

        $scope.pickNewBoxStatus = function(index, title) {
            $scope.data.newBox.status = title;
        }

        $scope.isNewBoxParamsCorrect = function() {
            var box = $scope.data.newBox;
            if ($.isEmptyObject(box.model) || $.isEmptyObject(box.status) || $.isEmptyObject(box.deviceId)) {
                return false;
            }

            // if ($.isEmptyObject(box.buyFrom)) {
            //     return false;
            // }
            // isNewBoxParamsCorrect
            // if (!Config.getFormatStringFromDate(box.buyAt)) {
            //     return false;
            // }

            // if (!Config.getFormatStringFromDate(box.storeDate)) {
            //     return false;
            // }

            if(!box.storeDate){
                return false;
            }

            return true;
        }

        $scope.createNewBox = function() {
            if (!$scope.isNewBoxParamsCorrect()) {
                $scope.openToast('warning', '温馨提示', '请正确填写所有箱子信息');
                return;
            }

            var boxInfo = {
                model: $scope.data.newBox.model,
                status: $scope.data.newBox.status,
                storeDate:moment($scope.data.newBox.storeDate).format('YYYY-MM-DD HH:mm:ss'),
                deviceId: $scope.data.newBox.deviceId
            }

            if (!$.isEmptyObject($scope.data.newBox.remark)) {
                boxInfo.remark = $scope.data.newBox.remark;
            }
            if (!$.isEmptyObject($scope.data.newBox.buyFrom)) {
                boxInfo.buyFrom = $scope.data.newBox.buyFrom
            }
            if ($scope.data.newBox.buyAt) {
                boxInfo.buyAt = moment($scope.data.newBox.buyAt).format('YYYY-MM-DD HH:mm:ss');
            }

            Http.post(Config.apiPath.box, boxInfo).then(function(data) {
                $scope.openToast('success', '创建成功', '您已成功创建一个箱子');
                $scope.initNewBoxParams();
                $scope.closeNewModal();
                $scope.refreshTable();

            }, function(msg) {
                $scope.openToast('error', '创建失败', msg);
            });
        }

        $scope.closeNewModal = function() {
                $scope.data.newModal.close();
            }
            /* ================= create a new hospital end  ================= */



        /* ================= update box info begin  ================= */
        $scope.pickBox = function(box) {
            Http.get(Config.apiPath.box + '/' + box.boxid, {}).then(function(data) {
                $scope.data.selectedBox = data;

                // 入库时间是必选的
                $scope.data.selectedBox.storeDate =  new Date(moment($scope.data.selectedBox.storeDate).format('YYYY-MM-DD'));
                // 购买时间可选的
                if ($scope.data.selectedBox.buyAt) {
                    $scope.data.selectedBox.buyAt = new Date(moment($scope.data.selectedBox.buyAt).format('YYYY-MM-DD'));
                }

                $scope.openDetailModal();

            }, function(msg) {

            });
        }

        $scope.openDetailModal = function() {
            var options = {
                animation: true,
                templateUrl: 'app/pages/transbox/database/box/modal/detail.html',
                size: 'lg',
                controller: 'BoxModalCtrl',
                controllerAs: 'DetailModalCtrl',
                bindToController: true,
                scope: $scope,
                backdrop: 'static',
                windowTopClass: 'transfer-modal-top-class'
            }
            $scope.data.detailModal = $uibModal.open(options);

            $scope.data.detailModal.closed.then(function() {
                console.log('modal is closed.');
            });
        }

        $scope.pickDetailBoxStatus = function(index, title) {
            $scope.data.selectedBox.status = title;
        }

        $scope.isDetailBoxParamsCorrect = function() {
            var box = $scope.data.selectedBox;
            if ($.isEmptyObject(box.model) || $.isEmptyObject(box.status) || $.isEmptyObject(box.deviceId)) {
                return false;
            }

            // if ($.isEmptyObject(box.buyFrom)) {
            //     return false;
            // }
            // isNewBoxParamsCorrect
            // if (!Config.getFormatStringFromDate(box.buyAt)) {
            //     return false;
            // }

            // if (!Config.getFormatStringFromDate(box.storeDate)) {
            //     return false;
            // }

            if(!box.storeDate){
                return false;
            }

            return true;
        }

        $scope.saveDetailBoxInfo = function() {
            if (!$scope.isDetailBoxParamsCorrect()) {
                $scope.openToast('warning', '温馨提示', '请正确填写所有箱子信息');
                return;
            }

            // var boxInfo = {
            //     model: $scope.data.selectedBox.model,
            //     status: $scope.data.selectedBox.status,
            //     buyFrom: $scope.data.selectedBox.buyFrom,
            //     buyAt: Config.getFormatStringFromDate($scope.data.selectedBox.buyAt),
            //     deviceId: $scope.data.selectedBox.deviceId
            // }
            //
            // if (!$.isEmptyObject($scope.data.selectedBox.remark)) {
            //     boxInfo.remark = $scope.data.selectedBox.remark;
            // }

            var boxInfo = {
                model: $scope.data.selectedBox.model,
                status: $scope.data.selectedBox.status,
                storeDate:moment($scope.data.selectedBox.storeDate).format('YYYY-MM-DD HH:mm:ss'),
                deviceId: $scope.data.selectedBox.deviceId
            }

            if (!$.isEmptyObject($scope.data.selectedBox.remark)) {
                boxInfo.remark = $scope.data.selectedBox.remark;
            }
            if (!$.isEmptyObject($scope.data.selectedBox.buyFrom)) {
                boxInfo.buyFrom = $scope.data.selectedBox.buyFrom
            }
            if ($scope.data.selectedBox.buyAt) {
                boxInfo.buyAt = moment($scope.data.selectedBox.buyAt).format('YYYY-MM-DD HH:mm:ss');
            }

            Http.put(Config.apiPath.box + '/' + $scope.data.selectedBox.boxid, boxInfo).then(function(data) {
                $scope.openToast('success', '保存成功', '您已成功修改该箱子信息');
                $scope.closeDetailModal();
                $scope.refreshTable();

            }, function(msg) {
                $scope.openToast('error', '创建失败', msg);
            });
        }

        $scope.closeDetailModal = function() {
                $scope.data.detailModal.close();
            }
            /* ================= create a new hospital end  ================= */

        $scope.propertyName = 'model';
        $scope.reverse = true;

        $scope.sortBy = function(propertyName) {
            $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
            $scope.propertyName = propertyName;
        };
    }



    // modal controller
    function BoxModalCtrl($scope) {
        console.log('box modal.....');
    }

})();
