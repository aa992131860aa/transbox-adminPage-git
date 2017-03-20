(function() {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.database.hospital')
        .controller('HospitalPageCtrl', HospitalPageCtrl)
        .controller('HospitalModalCtrl', HospitalModalCtrl);

    function HospitalPageCtrl($scope, $filter, $uibModal, editableOptions, editableThemes, Http, Config, toastr, toastrConfig) {
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

        var grades = angular.copy(Config.keyword.hospitalGrade);
        $scope.data = {
            pageData: {
                totalItems: 0,
                hospitals: [],
                displayedPages: 0,
                numberOfPages: 0,
                tableState: {}
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
            selectedHospital: {},
            keyword: {
                hospital: {
                    grade: grades.push('其他') ? grades : grades,
                    status: Config.keyword.hospitalStatus
                },
            },
            searchOptions: {
                name: '',
                district: '',
                address: ''
            },
            newHospital: {
                name: '',
                username: '',
                grade: '',
                district: '',
                register: 0,
                address: '',
                transferPersons: [{
                    organType: '',
                    name: '',
                    phone: '',
                    index: 0
                }],
                remark: '',
                boxes: [{
                    index: 0,
                    model: ''
                }]
            },
            newModal: {},
            boxOptions: [],
            showBoxOptions: []
        }

        $scope.resetPwds = function() {
            var accountIds = [];
            for (var i = 0; i < $scope.data.pageData.hospitals.length; i++) {
                var hosp = $scope.data.pageData.hospitals[i];
                if (hosp.checked) {
                    accountIds.push(hosp.account_id);
                }
            }

            if (accountIds.length > 0) {
                var params = {
                    accountIds: accountIds
                }
                Http.put(Config.apiPath.account + '/resetPwd', params).then(function(data) {
                    $scope.openToast('success', '重置成功', '重置医院密码成功');

                }, function(msg) {
                    $scope.openToast('error', '重置失败', '重置医院密码失败');
                });

            } else {
                $scope.openToast('warning', '温馨提示', '请先选择医院');
            }
        }

        $scope.getBoxOptions = function() {
            Http.get('/boxOptions', {}).then(function(data) {
                $scope.data.boxOptions = data;

            }, function(msg) {

            });
        }
        $scope.getBoxOptions();

        $scope.refreshTable = function() {
            if (parseInt($scope.data.pageData.numberOfPages) <= 1 && $scope.data.pageData.tableState) {
                $scope.getHospitals($scope.data.pageData.tableState);

            } else {
                angular
                    .element('#hospTablePagination')
                    .isolateScope()
                    .selectPage(1);
            }
        }

        $scope.searchHospitals = function() {
            $scope.refreshTable();
        }

        $scope.switchSelectAll = function() {
            $scope.data.selectAll = !$scope.data.selectAll;

            if ($scope.data.selectAll) {
                for (var i = 0; i < $scope.data.pageData.hospitals.length; i++) {
                    $scope.data.pageData.hospitals[i].checked = true;
                }

            } else {
                for (var i = 0; i < $scope.data.pageData.hospitals.length; i++) {
                    $scope.data.pageData.hospitals[i].checked = false;
                }
            }
        }

        $scope.checkHospital = function(event, index) {
            event.stopPropagation();
        };

        $scope.propertyName = 'name';
        $scope.reverse = true;

        $scope.sortBy = function(propertyName) {
            $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
            $scope.propertyName = propertyName;
        };

        //get all hospitals that status is not 'done'
        $scope.getHospitals = function(tableState) {
            console.log("tableState："+tableState);

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

            Http.get(Config.apiPath.hospitals, params).then(function(data) {
                $scope.data.pageData = data;
                tableState.pagination.numberOfPages = data.numberOfPages;
                $scope.data.pageData.displayedPages = Math.ceil(parseFloat(data.totalItems) / parseInt(data.numberOfPages));
                $scope.data.pageData.tableState = tableState;
                $scope.data.pagination.isLoading = false;

            }, function(msg) {
                console.log(msg);
            });
        }



        /* ================= create a new hospital begin  ================= */
        $scope.initNewHospParams = function() {
            $scope.data.newHospital = {
                name: '',
                username: '',
                grade: '',
                district: '',
                register: 0,
                address: '',
                transferPersons: [{
                    organType: '',
                    name: '',
                    phone: '',
                    index: 0
                }],
                remark: ''
            }
        }

        $scope.initNewHospBoxOptions = function() {
            var newHospBoxIds = [];
            for (var i = 0; i < $scope.data.newHospital.boxes.length; i++) {
                var box = $scope.data.newHospital.boxes[i];
                if (box.boxid) {
                    newHospBoxIds.push(box.boxid);
                }
            }

            var showBoxes = [];
            for (var i = 0; i < $scope.data.boxOptions.length; i++) {
                var box = $scope.data.boxOptions[i];
                if (newHospBoxIds.indexOf(box.boxid) === -1) {
                    showBoxes.push(box);
                }
            }

            $scope.data.showBoxOptions = showBoxes;
        }

        $scope.openNewModal = function() {
            var options = {
                animation: true,
                templateUrl: 'app/pages/transbox/database/hospital/modal/new.html',
                size: 'lg',
                controller: 'HospitalModalCtrl',
                controllerAs: 'DetailModalCtrl',
                bindToController: true,
                scope: $scope,
                backdrop: 'static',
                windowTopClass: 'transfer-modal-top-class'
            }
            $scope.data.newModal = $uibModal.open(options);

            $scope.data.newModal.closed.then(function() {
                console.log('modal is closed.');
                console.log($scope.data.newHospital);
            });

            $scope.data.newModal.rendered.then(function() {
                if ($scope.data.newHospital.register === 0) {
                    $('#newHospStatus').val($scope.data.keyword.hospital.status[0]);

                } else {
                    $('#newHospStatus').val($scope.data.keyword.hospital.status[1]);
                }

                //init show box options
                $scope.initNewHospBoxOptions();
            });
        }

        $scope.pickNewHospGrade = function(index, title) {
            if (index === $scope.data.keyword.hospital.grade.length - 1) {
                $('#newHospGrade').removeAttr('readonly', 'readonly');
                $('#newHospGrade').removeAttr('disabled', 'disabled');
                $('#newHospGrade').val('');
                $('#newHospGrade').focus();

            } else {
                $('#newHospGrade').attr('readonly', 'readonly');
                $('#newHospGrade').attr('disabled', 'disabled');
                $scope.data.newHospital.grade = title;
            }
        }

        $scope.pickNewHospStatus = function(index, title) {
            $scope.data.newHospital.status = index;
            $('#newHospStatus').val(title);
        }

        $scope.newHospBoxOnToggle = function(open) {
            console.log(open);
            if (!open) {
                $scope.initNewHospBoxOptions();
            }
        }

        $scope.pickNewHospBox = function(index, box) {
            $scope.data.newHospital.boxes[index] = box;
        }

        $scope.newHospAddPerson = function() {
            var person = {
                organType: '',
                name: '',
                phone: '',
                index: $scope.data.newHospital.transferPersons.length
            }
            $scope.data.newHospital.transferPersons.push(person);
        }

        $scope.newHospRemovePerson = function() {
            if ($scope.data.newHospital.transferPersons.length > 1) {
                $scope.data.newHospital.transferPersons.pop();

            } else {
                $scope.openToast('warning', '温馨提示', '您至少需要填写一个转运人信息');
            }
        }

        $scope.newHospAddBox = function() {
            var allDone = true;
            for (var i = 0; i < $scope.data.newHospital.boxes.length; i++) {
                var box = $scope.data.newHospital.boxes[i];
                if (box.boxid && box.boxid.length > 0) {

                } else {
                    allDone = false;
                    break;
                }
            }

            if (allDone) {
                if ($scope.data.showBoxOptions.length > 0) {
                    var newBox = {
                        model: '',
                        index: $scope.data.newHospital.boxes.length
                    }

                    $scope.data.newHospital.boxes.push(newBox);

                } else {
                    $scope.openToast('warning', '温馨提示', '您已选择所有箱子');
                }

            } else {
                $scope.openToast('warning', '温馨提示', '您有未选择的选项');
            }
        }

        $scope.newHospRemoveBox = function() {
            if ($scope.data.newHospital.boxes.length > 1) {
                $scope.data.newHospital.boxes.pop();
                $scope.initNewHospBoxOptions();

            } else {
                $scope.openToast('warning', '温馨提示', '您至少需要选择一个箱子');
            }
        }

        $scope.isNewHospParamsCorrect = function() {
            var hosp = $scope.data.newHospital;
            console.log(hosp);
            if ($.isEmptyObject(hosp.name) || $.isEmptyObject(hosp.grade) || $.isEmptyObject(hosp.district)) {
                return false;
            }

            if ($.isEmptyObject(hosp.address) || $.isEmptyObject(hosp.username)) {
                return false;
            }

            if (!hosp.transferPersons) {
                return false;
            }

            for (var i = 0; i < hosp.transferPersons.length; i++) {
                var person = hosp.transferPersons[i];
                if ($.isEmptyObject(person.organType) || $.isEmptyObject(person.name) || $.isEmptyObject(person.phone)) {
                    return false;
                }
            }

            if (!hosp.boxes || hosp.boxes.length === 0) {
                return false;
            }

            for (var i = 0; i < hosp.boxes.length; i++) {
                var box = hosp.boxes[i];
                if ($.isEmptyObject(box.boxid)) {
                    return false;
                }
            }

            return true;
        }

        $scope.createNewHospital = function() {
            $scope.data.newHospital.district = $('#hosCitypicker').val();

            if (!$scope.isNewHospParamsCorrect()) {
                $scope.openToast('warning', '温馨提示', '请正确填写所有医院信息');
                return;
            }

            var hospitalInfo = {
                name: $scope.data.newHospital.name,
                grade: $scope.data.newHospital.grade,
                register: $scope.data.newHospital.register,
                district: $scope.data.newHospital.district,
                address: $scope.data.newHospital.address,
                username: $scope.data.newHospital.username
            }

            var boxIds = [];
            for (var i = 0; i < $scope.data.newHospital.boxes.length; i++) {
                var box = $scope.data.newHospital.boxes[i];
                if (!$.isEmptyObject(box.boxid)) {
                    boxIds.push(box.boxid);
                }
            }

            if (boxIds.length > 0) {
                hospitalInfo.boxes = boxIds;
            }

            if (!$.isEmptyObject($scope.data.newHospital.remark)) {
                hospitalInfo.remark = $scope.data.newHospital.remark;
            }

            var params = {
                hospitalInfo: hospitalInfo,
                transferPersons: $scope.data.newHospital.transferPersons,
            }

            Http.post(Config.apiPath.hospital, params).then(function(data) {
                $scope.openToast('success', '创建成功', '您已成功创建一个医院');
                $scope.initNewHospParams();
                $scope.closeNewModal();
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

        $scope.getHospitalDetail = function(hospitalid, next) {
            Http.get(Config.apiPath.hospital + '/' + hospitalid, {}).then(function(data) {
                if ($.isFunction(next)) {
                    next(null, data);
                }

            }, function(msg) {
                if ($.isFunction(next)) {
                    next(msg);
                }
            });
        }

        /* ================= update hospital info begin  ================= */
        $scope.initDetailHospBoxOptions = function() {
            var detailHospBoxIds = [];
            for (var i = 0; i < $scope.data.selectedHospital.boxes.length; i++) {
                var box = $scope.data.selectedHospital.boxes[i];
                if (box.boxid) {
                    detailHospBoxIds.push(box.boxid);
                }
            }

            var showBoxes = [];
            for (var i = 0; i < $scope.data.boxOptions.length; i++) {
                var box = $scope.data.boxOptions[i];
                if (detailHospBoxIds.indexOf(box.boxid) === -1) {
                    showBoxes.push(box);
                }
            }

            $scope.data.showBoxOptions = showBoxes;
        }

        $scope.openDetailModal = function() {
            var options = {
                animation: true,
                templateUrl: 'app/pages/transbox/database/hospital/modal/detail.html',
                size: 'lg',
                controller: 'HospitalModalCtrl',
                controllerAs: 'DetailModalCtrl',
                bindToController: true,
                scope: $scope,
                backdrop: 'static',
                windowTopClass: 'transfer-modal-top-class'
            }
            $scope.data.detailModal = $uibModal.open(options);

            $scope.data.detailModal.closed.then(function() {
                console.log('modal is closed.');
                console.log($scope.data.selectedHospital);
            });

            $scope.data.detailModal.rendered.then(function() {
                if ($scope.data.selectedHospital.register === 0) {
                    $('#detailHospStatus').val($scope.data.keyword.hospital.status[0]);

                } else {
                    $('#detailHospStatus').val($scope.data.keyword.hospital.status[1]);
                }

                $scope.initDetailHospBoxOptions();
            });
        }

        $scope.detailHospBoxOnToggle = function(open) {
            console.log(open);
            if (!open) {
                $scope.initDetailHospBoxOptions();
            }
        }

        $scope.pickDetailHospBox = function(index, box) {
            $scope.data.selectedHospital.boxes[index] = box;
        }

        $scope.detailHospAddPerson = function() {
            var person = {
                organType: '',
                name: '',
                phone: '',
                index: $scope.data.selectedHospital.transferPersons.length
            }
            $scope.data.selectedHospital.transferPersons.push(person);
        }

        $scope.detailHospRemovePerson = function() {
            if ($scope.data.selectedHospital.transferPersons.length > 1) {
                $scope.data.selectedHospital.transferPersons.pop();

            } else {
                $scope.openToast('warning', '温馨提示', '您至少需要填写一个转运人信息');
            }
        }

        $scope.detailHospAddBox = function() {
            var allDone = true;
            for (var i = 0; i < $scope.data.selectedHospital.boxes.length; i++) {
                var box = $scope.data.selectedHospital.boxes[i];
                if (box.boxid && box.boxid.length > 0) {

                } else {
                    allDone = false;
                    break;
                }
            }

            if (allDone) {
                if ($scope.data.showBoxOptions.length > 0) {
                    var newBox = {
                        model: '',
                        index: $scope.data.selectedHospital.boxes.length
                    }

                    $scope.data.selectedHospital.boxes.push(newBox);

                } else {
                    $scope.openToast('warning', '温馨提示', '您已选择所有箱子');
                }

            } else {
                $scope.openToast('warning', '温馨提示', '您有未选择的选项');
            }
        }

        $scope.detailHospRemoveBox = function() {
            if ($scope.data.selectedHospital.boxes.length > 1) {
                $scope.data.selectedHospital.boxes.pop();
                $scope.initDetailHospBoxOptions();

            } else {
                $scope.openToast('warning', '温馨提示', '您至少需要选择一个箱子');
            }
        }

        $scope.closeDetailModal = function() {
            $scope.data.detailModal.close();
        }

        $scope.pickHospital = function(hospital) {
            $scope.getHospitalDetail(hospital.hospitalid, function(msg, data) {
                if (msg) {
                    console.log(msg);
                    return;
                }

                $scope.data.selectedHospital = data;
                $scope.openDetailModal();
            });
        }

        $scope.pickDetailHospGrade = function(index, title) {
            if (index === $scope.data.keyword.hospital.grade.length - 1) {
                $('#detailHospGrade').removeAttr('readonly', 'readonly');
                $('#detailHospGrade').removeAttr('disabled', 'disabled');
                $('#detailHospGrade').val('');
                $('#detailHospGrade').focus();

            } else {
                $('#detailHospGrade').attr('readonly', 'readonly');
                $('#detailHospGrade').attr('disabled', 'disabled');
                $scope.data.selectedHospital.grade = title;
            }
        }

        $scope.pickDetailHospStatus = function(index, title) {
            $scope.data.selectedHospital.status = index;
            $('#detailHospStatus').val(title);
        }

        $scope.isUpdateParamsCorrect = function() {
            var hosp = $scope.data.selectedHospital;
            if ($.isEmptyObject(hosp.name) || $.isEmptyObject(hosp.grade) || $.isEmptyObject(hosp.district)) {
                return false;
            }

            if ($.isEmptyObject(hosp.address)) {
                return false;
            }

            if (!hosp.transferPersons || hosp.transferPersons.length === 0) {
                return false;
            }

            for (var i = 0; i < hosp.transferPersons.length; i++) {
                var person = hosp.transferPersons[i];
                if ($.isEmptyObject(person.organType) || $.isEmptyObject(person.name) || $.isEmptyObject(person.phone)) {
                    return false;
                }
            }

            if (!hosp.boxes || hosp.boxes.length === 0) {
                return false;
            }

            for (var i = 0; i < hosp.boxes.length; i++) {
                var box = hosp.boxes[i];
                if ($.isEmptyObject(box.boxid)) {
                    return false;
                }
            }

            return true;
        }

        $scope.saveSelectedHospInfo = function() {
                $scope.data.selectedHospital.district = $('#hosCitypickerDetail').val();

                if (!$scope.isUpdateParamsCorrect()) {
                    $scope.openToast('warning', '温馨提示', '请正确填写所有医院信息');
                    return;
                }

                var hospitalInfo = {
                    name: $scope.data.selectedHospital.name,
                    grade: $scope.data.selectedHospital.grade,
                    register: $scope.data.selectedHospital.register,
                    district: $scope.data.selectedHospital.district,
                    address: $scope.data.selectedHospital.address,
                    username: $scope.data.selectedHospital.accountInfo.username,
                }

                var boxIds = [];
                for (var i = 0; i < $scope.data.selectedHospital.boxes.length; i++) {
                    var box = $scope.data.selectedHospital.boxes[i];
                    if (!$.isEmptyObject(box.boxid)) {
                        boxIds.push(box.boxid);
                    }
                }

                if (boxIds.length > 0) {
                    hospitalInfo.boxes = boxIds;
                }

                if (!$.isEmptyObject($scope.data.selectedHospital.remark)) {
                    hospitalInfo.remark = $scope.data.selectedHospital.remark;
                }

                var params = {
                    hospitalInfo: hospitalInfo,
                    transferPersons: $scope.data.selectedHospital.transferPersons,
                }

                Http.put(Config.apiPath.hospital + '/' + $scope.data.selectedHospital.hospitalid, params).then(function(data) {
                    $scope.openToast('success', '保存成功', '您已成功保存该医院信息');
                    $scope.closeDetailModal();
                    $scope.refreshTable();

                }, function(msg) {
                    $scope.openToast('error', '保存失败', msg);
                });
            }
            /* ================= update hospital info end  ================= */

    }


    // modal controller
    function HospitalModalCtrl($scope) {
        console.log('hospital modal.....');
    }

})();