(function() {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.database.opo')
        .controller('OpoPageCtrl', OpoPageCtrl)
        .controller('OpoModalCtrl', OpoModalCtrl);

    function OpoPageCtrl($scope, $filter, editableOptions, editableThemes, Http, Config, $uibModal, toastr, toastrConfig) {
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


        $scope.data = {
            pageData: {
                totalItems: 0,
                opos: [],
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
            selectedOpo: {},
            searchOptions: {
                name: '',
                district: '',
                address: ''
            },
            newOpo: {
                name: '',
                username: '',
                grade: '',
                district: '',
                register: 0,
                address: '',
                remark: ''
            },
            gradeOptions: Config.keyword.opoGrade.push('其他') ? Config.keyword.opoGrade : Config.keyword.opoGrade,
        }

        //get all opos
        $scope.getOpos = function(tableState) {
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

            if (!$.isEmptyObject($scope.data.searchOptions.name)) {
                params.name = $scope.data.searchOptions.name
            }

            if (!$.isEmptyObject($scope.data.searchOptions.district)) {
                params.district = $scope.data.searchOptions.district
            }

            if (!$.isEmptyObject($scope.data.searchOptions.address)) {
                params.address = $scope.data.searchOptions.address
            }

            Http.get(Config.apiPath.opos, params).then(function(data) {
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
                $scope.getOpos($scope.data.pageData.tableState);

            } else {
                angular
                    .element('#opoTablePagination')
                    .isolateScope()
                    .selectPage(1);
            }
        }

        $scope.searchOpos = function() {
            $scope.refreshTable();
        }

        $scope.switchSelectAll = function() {
            $scope.data.selectAll = !$scope.data.selectAll;

            if ($scope.data.selectAll) {
                for (var i = 0; i < $scope.data.pageData.opos.length; i++) {
                    $scope.data.pageData.opos[i].checked = true;
                }

            } else {
                for (var i = 0; i < $scope.data.pageData.opos.length; i++) {
                    $scope.data.pageData.opos[i].checked = false;
                }
            }
        }

        $scope.checkOpo = function(event, index) {
            event.stopPropagation();
        }

        /* ================= create a new opo begin  ================= */
        $scope.initNewOpoParams = function() {
            $scope.data.newHospital = {
                name: '',
                username: '',
                grade: '',
                district: '',
                register: 0,
                address: '',
                remark: ''
            }
        }

        $scope.openNewModal = function() {
            console.log('3333');
            var options = {
                animation: true,
                templateUrl: 'app/pages/transbox/database/opo/modal/new.html',
                size: 'lg',
                controller: 'OpoModalCtrl',
                controllerAs: 'NewModalCtrl',
                bindToController: true,
                scope: $scope,
                backdrop: 'static',
                windowTopClass: 'transfer-modal-top-class'
            }
            $scope.data.newModal = $uibModal.open(options);

            $scope.data.newModal.closed.then(function() {
                console.log('modal is closed.');
                console.log($scope.data.newOpo);
            });
        }

        $scope.pickNewOpoGrade = function(index, title) {
            if (index === $scope.data.gradeOptions.length - 1) {
                $('#newOpoGrade').removeAttr('readonly', 'readonly');
                $('#newOpoGrade').removeAttr('disabled', 'disabled');
                $('#newOpoGrade').val('');
                $('#newOpoGrade').focus();

            } else {
                $('#newOpoGrade').attr('readonly', 'readonly');
                $('#newOpoGrade').attr('disabled', 'disabled');
                $scope.data.newOpo.grade = title;
            }
        }

        $scope.isNewOpoParamsCorrect = function() {
            var opo = $scope.data.newOpo;
            console.log(opo);
            if ($.isEmptyObject(opo.name) || $.isEmptyObject(opo.grade) || $.isEmptyObject(opo.district)) {
                return false;
            }

            if ($.isEmptyObject(opo.address) || $.isEmptyObject(opo.contactPerson) || $.isEmptyObject(opo.contactPhone)) {
                return false;
            }

            return true;
        }

        $scope.createNewOpo = function() {
            $scope.data.newOpo.district = $('#opoCitypicker').val();

            if (!$scope.isNewOpoParamsCorrect()) {
                $scope.openToast('warning', '温馨提示', '请正确填写所有OPO信息');
                return;
            }

            var opoInfo = {
                name: $scope.data.newOpo.name,
                grade: $scope.data.newOpo.grade,
                contactPerson: $scope.data.newOpo.contactPerson,
                district: $scope.data.newOpo.district,
                address: $scope.data.newOpo.address,
                contactPhone: $scope.data.newOpo.contactPhone
            }

            if (!$.isEmptyObject($scope.data.newOpo.remark)) {
                opoInfo.remark = $scope.data.newOpo.remark;
            }

            Http.post(Config.apiPath.opo, opoInfo).then(function(data) {
                $scope.openToast('success', '创建成功', '您已成功创建一个OPO');
                $scope.initNewOpoParams();
                $scope.closeNewModal();
                $scope.initNewOpoParams();
                $scope.data.searchOptions = {
                    name: '',
                    district: '',
                    address: ''
                }
                $scope.refreshTable();

            }, function(msg) {
                $scope.openToast('error', '创建失败', msg);
            });
        }

        $scope.closeNewModal = function() {
                $scope.data.newModal.close();
            }
            /* ================= create a new hospital end  ================= */

        /* ================= update a new opo begin  ================= */
        $scope.pickOpo = function(opo) {
            $scope.data.selectedOpo = angular.copy(opo);
            $scope.openDetailModal();
        }

        $scope.openDetailModal = function() {
            var options = {
                animation: true,
                templateUrl: 'app/pages/transbox/database/opo/modal/detail.html',
                size: 'lg',
                controller: 'OpoModalCtrl',
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

        $scope.pickDetailOpoGrade = function(index, title) {
            if (index === $scope.data.gradeOptions.length - 1) {
                $('#detailOpoGrade').removeAttr('readonly', 'readonly');
                $('#detailOpoGrade').removeAttr('disabled', 'disabled');
                $('#detailOpoGrade').val('');
                $('#detailOpoGrade').focus();

            } else {
                $('#detailOpoGrade').attr('readonly', 'readonly');
                $('#detailOpoGrade').attr('disabled', 'disabled');
                $scope.data.selectedOpo.grade = title;
            }
        }

        $scope.isDetailOpoParamsCorrect = function() {
            var opo = $scope.data.selectedOpo;
            console.log(opo);
            if ($.isEmptyObject(opo.name) || $.isEmptyObject(opo.grade) || $.isEmptyObject(opo.district)) {
                return false;
            }

            if ($.isEmptyObject(opo.address) || $.isEmptyObject(opo.contactPerson) || $.isEmptyObject(opo.contactPhone)) {
                return false;
            }

            return true;
        }

        $scope.saveSelectedOpoInfo = function() {
            $scope.data.selectedOpo.district = $('#opoCitypickerDetail').val();

            if (!$scope.isDetailOpoParamsCorrect()) {
                $scope.openToast('warning', '温馨提示', '请正确填写所有OPO信息');
                return;
            }

            var opoInfo = {
                name: $scope.data.selectedOpo.name,
                grade: $scope.data.selectedOpo.grade,
                contactPerson: $scope.data.selectedOpo.contactPerson,
                district: $scope.data.selectedOpo.district,
                address: $scope.data.selectedOpo.address,
                contactPhone: $scope.data.selectedOpo.contactPhone
            }

            if (!$.isEmptyObject($scope.data.selectedOpo.remark)) {
                opoInfo.remark = $scope.data.selectedOpo.remark;
            }

            Http.put(Config.apiPath.opo + '/' + $scope.data.selectedOpo.opoid, opoInfo).then(function(data) {
                $scope.openToast('success', '保存成功', '您已成功保存OPO信息');

                $scope.closeDetailModal();
                $scope.refreshTable();
                // $scope.getOpos();

            }, function(msg) {
                $scope.openToast('error', '保存失败', msg);
            });
        }

        $scope.closeDetailModal = function() {
                $scope.data.detailModal.close();
            }
            /* ================= create a new hospital end  ================= */
        $scope.propertyName = 'name';
        $scope.reverse = true;

        $scope.sortBy = function(propertyName) {
            $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
            $scope.propertyName = propertyName;
        };

    }

    // modal controller
    function OpoModalCtrl($scope) {
        console.log('opo modal.....');
    }

})();