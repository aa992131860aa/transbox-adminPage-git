(function() {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.transfering')
        .controller('TransferingPageCtrl', TransferingPageCtrl)
        .controller('TransferingModalCtrl', TransferingModalCtrl);

    function TransferingPageCtrl($scope, $filter, editableOptions, editableThemes, Http, Config, $uibModal, Common, $interval) {
        $scope.open = function (page, size, ctrl, params, saveCB, cancelCB) {
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: ctrl,
                bindToController: true,
                resolve: {
                    params: params
                },
                windowTopClass: "transfer-modal-top-class"
            }).result.then(function (result) {
                saveCB(result);
            }, function (result) {
                cancelCB(result);
            });
        };

        $scope.data = {
            pageData: {
                totalItems: 0,
                transfers: [],
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
            selectedTransfer: {},
            searchOptions: {
                transferNumber: '',
                organSegNumber: '',
                organType: '',
                transferPersonName: '',
                fromCity: '',
                toHospitalName: '',
                beginDate: '',
                endDate: ''
            },
            beginDate: {
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
            endDate: {
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
            newTransfer: {
                model: '',
                boxNumber: '',
                status: '',
                buyFrom: '',
                buyAt: '',
                remark: ''
            },
            modalPageIndex: 0, //0 for basic info, 1 for realtime info
            //below is for xiyangyang data show
            pageState: 2,
            humidity: {}, // 统计湿度max/min
            temperature: {}, // 统计温度max/min
            openData: [],
            collisionData: [],
            crashData: [] //总的crash 数据
        }

        $scope.toggleBeginDatepicker = function() {
            $scope.data.beginDate.isOpen = !$scope.data.beginDate.isOpen;
        }

        $scope.toggleEndDatepicker = function() {
            $scope.data.endDate.isOpen = !$scope.data.endDate.isOpen;
        }

        $scope.getDateString = function(obj) {
            return Config.getDateStringFromObject(obj);
        }

        //get all transfers that status is not 'done'
        $scope.getTransfers = function(tableState) {
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
                number: number,
                type: 'transfering'
            }

            if (Config.userInfo.type === 'hospital' && Config.userInfo.hospitalInfo) {
                params.hospitalid = Config.userInfo.hospitalInfo.hospitalid;
            }

            if (!$.isEmptyObject($scope.data.searchOptions.transferNumber)) {
                params.transferNumber = $scope.data.searchOptions.transferNumber
            }

            if (!$.isEmptyObject($scope.data.searchOptions.organSegNumber)) {
                params.organSegNumber = $scope.data.searchOptions.organSegNumber
            }

            if (!$.isEmptyObject($scope.data.searchOptions.organType)) {
                params.organType = $scope.data.searchOptions.organType
            }

            if (!$.isEmptyObject($scope.data.searchOptions.transferPersonName)) {
                params.transferPersonName = $scope.data.searchOptions.transferPersonName
            }

            if (!$.isEmptyObject($scope.data.searchOptions.fromCity)) {
                params.fromCity = $scope.data.searchOptions.fromCity
            }

            if (!$.isEmptyObject($scope.data.searchOptions.toHospitalName)) {
                params.toHospitalName = $scope.data.searchOptions.toHospitalName
            }

            if($scope.data.searchOptions.beginDate){
                params.beginDate = moment($scope.data.searchOptions.beginDate).format('YYYY-MM-DD');
            }

            if($scope.data.searchOptions.endDate){
                params.endDate = moment($scope.data.searchOptions.endDate).format('YYYY-MM-DD');
            }

            // if (Config.getFormatStringFromDate(beginDate)) {
            //     params.beginDate = Config.getFormatStringFromDate(beginDate);
            // }
            //
            // var endDate = $scope.data.searchOptions.endDate;
            // if (Config.getFormatStringFromDate(endDate)) {
            //     params.endDate = Config.getFormatStringFromDate(endDate);
            // }

            Http.get(Config.apiPath.transfers, params).then(function(data) {
                $scope.data.pageData = data;
                tableState.pagination.numberOfPages = data.numberOfPages;
                $scope.data.pageData.displayedPages = Math.ceil(parseFloat(data.totalItems) / parseInt(data.numberOfPages));
                $scope.data.pageData.tableState = tableState;
                $scope.data.pagination.isLoading = false;

            }, function(msg) {
                console.log(msg);
                $scope.data.pagination.isLoading = false;
            });
        }

        $scope.refreshTable = function() {
            if (parseInt($scope.data.pageData.numberOfPages) <= 1 && $scope.data.pageData.tableState) {
                $scope.getTransfers($scope.data.pageData.tableState);

            } else {
                angular
                    .element('#transferTablePagination')
                    .isolateScope()
                    .selectPage(1);
            }
        }

        $scope.searchTransfers = function() {
            $scope.refreshTable();
        }

        $scope.switchSelectAll = function() {
            $scope.data.selectAll = !$scope.data.selectAll;

            if ($scope.data.selectAll) {
                for (var i = 0; i < $scope.data.pageData.transfers.length; i++) {
                    $scope.data.pageData.transfers[i].checked = true;
                }

            } else {
                for (var i = 0; i < $scope.data.pageData.transfers.length; i++) {
                    $scope.data.pageData.transfers[i].checked = false;
                }
            }
        }

        $scope.checkTransfer = function(event, index) {
            event.stopPropagation();
        }

        /* ================= create a new box begin  ================= */
        $scope.pickTransfer = function(transfer) {
            var params = {
                organSegNumber: transfer.organInfo.segNumber,
                transferNumber: transfer.transferNumber
            };
            // Http.get('/transferInfo', params).then(function(data) {
            //     $scope.data.selectedTransfer = data;
            //     $scope.initData();
            //     $scope.openDetailModal();
            //
            // }, function(msg) {
            //
            // });
            $scope.open('app/pages/transbox/transfering/modal/detail.html', 'lg',
                TransferingModalCtrl, {name: params},
                function (item) {

                }, function (err) {

                });
        }

        $scope.openDetailModal = function() {
            // var options = {
            //     animation: true,
            //     templateUrl: 'app/pages/transbox/transfering/modal/detail.html',
            //     size: 'lg',
            //     controller: 'TransferingModalCtrl',
            //     controllerAs: 'DetailModalCtrl',
            //     bindToController: true,
            //     scope: $scope,
            //     backdrop: 'static',
            //     windowTopClass: 'transfer-modal-top-class'
            // }
            // $scope.data.detailModal = $uibModal.open(options);
            //
            // $scope.beginTimer();
            // $scope.data.detailModal.closed.then(function() {
            //     console.log('modal is closed.');
            //     console.log($scope.data.newTransfer);
            //     $interval.cancel($scope.data.timer);
            // });
        }

        $scope.isDetailTransferParamsCorrect = function() {
            var opo = $scope.data.newTransfer;
            console.log(opo);
            if ($.isEmptyObject(opo.name) || $.isEmptyObject(opo.grade) || $.isEmptyObject(opo.district)) {
                return false;
            }

            if ($.isEmptyObject(opo.address) || $.isEmptyObject(opo.contactPerson) || $.isEmptyObject(opo.contactPhone)) {
                return false;
            }

            return true;
        }

        $scope.createDetailBox = function() {
            if (!$scope.isDetailBoxParamsCorrect()) {
                $scope.openToast('warning', '温馨提示', '请正确填写所有OPO信息');
                return;
            }

            var opoInfo = {
                name: $scope.data.newBox.name,
                grade: $scope.data.newBox.grade,
                contactPerson: $scope.data.newBox.contactPerson,
                district: $scope.data.newBox.district,
                address: $scope.data.newBox.address,
                contactPhone: $scope.data.newBox.contactPhone
            }

            if (!$.isEmptyObject($scope.data.newBox.remark)) {
                opoInfo.remark = $scope.data.newBox.remark;
            }

            Http.post(Config.apiPath.opo, opoInfo).then(function(data) {
                $scope.openToast('success', '创建成功', '您已成功创建一个OPO');
                $scope.initDetailBoxParams();
                $scope.closeDetailModal();
                $scope.refreshPage();
                // $scope.getBoxs();

            }, function(msg) {
                $scope.openToast('error', '创建失败', msg);
            });
        }

        $scope.closeDetailModal = function() {
                $scope.data.detailModal.close();
            }
            /* ================= create a new hospital end  ================= */

        // =================== data begin ====================
        // morris
        // $scope.info = {};
        // $scope.lineModerationData = [];
        // $scope.lineData = [];
        // $scope.colors = ["#379DF2", "#F8B513"];
        // $scope.initDate = function(x) {
        //     var date = new Date(x);
        //     var m = date.getMonth() + 1;
        //     m = m < 10 ? ('0' + m) : m;
        //     var d = date.getDate();
        //     d = d < 10 ? ('0' + d) : d;
        //     var h = date.getHours();
        //     var minute = date.getMinutes();
        //     minute = minute < 10 ? ('0' + minute) : minute;
        //     return m + '-' + d + ' ' + h + ':' + minute;
        // };
        //
        // // page data
        // $scope.getCrashInfo = function() {
        //     var p1 = {
        //         transferid: $scope.info.transferid,
        //         type: "open"
        //     };
        //
        //     Http.get("/records2", p1).then(function(suc) {
        //         $scope.data.openData = suc;
        //         $scope.getCollisionData();
        //     }, function(fail) {
        //
        //     });
        // };
        // $scope.getCollisionData = function() {
        //     var p2 = {
        //         transferid: $scope.info.transferid,
        //         type: "collision"
        //     };
        //
        //     Http.get("/records2", p2).then(function(suc) {
        //         // init数组
        //         $scope.data.crashData = [];
        //
        //         $scope.data.collisionData = suc;
        //         var oSize = $scope.data.openData.length;
        //         var cSize = $scope.data.collisionData.length;
        //         if (oSize > 0 || cSize > 0) {
        //             var size = oSize > cSize ? oSize : cSize;
        //             for (var i = 0; i < size; i++) {
        //                 $scope.data.crashData.push({
        //                     oInfo: $scope.data.openData[i] ? $scope.data.openData[i] : '--',
        //                     cInfo: $scope.data.collisionData[i] ? $scope.data.collisionData[i] : '--'
        //                 })
        //             }
        //         } else {
        //             $scope.data.crashData.push({
        //                 oInfo: '--',
        //                 cInfo: '--'
        //             })
        //         }
        //
        //     }, function(fail) {
        //
        //     });
        // };
        // $scope.initData = function() {
        //     $scope.info = $scope.data.selectedTransfer;
        //     if ($scope.info.records.length < 1) {
        //         return;
        //     }
        //
        //     $scope.getCrashInfo();
        //
        //     var data = [];
        //     var humidity = [];
        //     for (var i = 0; i < $scope.info.records.length; i++) {
        //         var temp = $scope.info.records[i];
        //         if (temp.humidity) {
        //             humidity.push(parseInt(temp.humidity));
        //             data.push({
        //                 y: temp.recordAt,
        //                 a: temp.humidity
        //             })
        //         }
        //     }
        //     $scope.lineModerationData = data;
        //     if (humidity) {
        //         $scope.data.humidity.max = Common.arrMaxNum2(humidity) + "%";
        //         $scope.data.humidity.min = Common.arrMinNum2(humidity) + "%";
        //         $scope.data.humidity.avg = Common.arrAverageNum2(humidity) + "%";
        //     }
        //
        //     // 温度
        //     var tData = [];
        //     var temperature = [];
        //     for (var j = 0; j < $scope.info.records.length; j++) {
        //         var item = $scope.info.records[j];
        //         if (item.temperature && item.avgTemperature) {
        //             temperature.push(parseFloat(item.temperature));
        //             tData.push({
        //                 y: item.recordAt,
        //                 a: item.temperature,
        //                 b: item.avgTemperature
        //             })
        //         }
        //     }
        //     $scope.lineData = tData;
        //     if (temperature) {
        //         $scope.data.temperature.max = Common.arrMaxNum2(temperature) + "℃";
        //         $scope.data.temperature.min = Common.arrMinNum2(temperature) + "℃";
        //     }
        //
        //     // 开始时间
        //     $scope.info.startAtShow = $scope.info.startAt.substring(5, 16);
        //     // 获取器官时间
        //     $scope.info.getOrganAtShow = $scope.info.getOrganAt.substring(0, 16);
        //
        // };
        //
        // // fullPage
        // $scope.mainOptions = {
        //     sectionsColor: ['#f0ad4e', '#2E8FE0', '#f0ad4e'],
        //     navigation: true,
        //     navigationPosition: 'right',
        //     scrollingSpeed: 1000
        // };
        //
        // // click
        // $scope.viewBaseInfo = function() {
        //     $scope.data.pageState = 1;
        //     $('#base').addClass('btn-active');
        //     $('#trans').removeClass('btn-active');
        // };
        //
        // $scope.viewTransInfo = function() {
        //     $scope.data.pageState = 2;
        //     $('#trans').addClass('btn-active');
        //     $('#base').removeClass('btn-active');
        // };


        // $scope.beginTimer = function() {
        //     $scope.data.timer = $interval(function() {
        //         var params = {};
        //         if ($scope.data.selectedTransfer && $scope.data.selectedTransfer.records && $scope.data.selectedTransfer.records.length > 0) {
        //             var params = {
        //                 transferid: $scope.data.selectedTransfer.transferid,
        //                 createAt: $scope.data.selectedTransfer.records[$scope.data.selectedTransfer.records.length - 1].createAt
        //             };
        //
        //         } else if ($scope.data.selectedTransfer) {
        //             params = {
        //                 transferid: $scope.data.selectedTransfer.transferid,
        //                 createAt: "2000-01-01 00:00:00"
        //             }
        //
        //         } else {
        //             return;
        //         }
        //
        //         // 更新baseInfo
        //         Http.get("/records", params).then(function(data) {
        //
        //             for (var i = 0; i < data.length; i++) {
        //                 $scope.data.selectedTransfer.records.push(data[i]);
        //             }
        //             // 更新$scope数据
        //             $scope.initData();
        //
        //         }, function(msg) {
        //
        //         });
        //
        //     }, 50000); //间隔50秒定时执行
        // }
        //
        // $scope.$on('destroy', function() {
        //     $interval.cancel($scope.timer);
        // });

        $scope.propertyName = 'transferNumber';
        $scope.reverse = true;

        $scope.sortBy = function(propertyName) {
            $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
            $scope.propertyName = propertyName;
        };
    }

    // modal controller
    function TransferingModalCtrl($scope, Http, params, Common,$interval,$timeout) {
        $timeout(function () {
            // 根据传过来的参数 获取记录
            Http.get('/transferInfo', params.name).then(
                function (data) {
                    $scope.info = data;
                    if ($scope.info) {
                        $scope.initData();
                    }
                    $scope.beginTimer(); // start timer
                }, function (msg) {

                });
        }, 1000);

        $scope.data = {
            modalPageIndex: 0,
            humidity: {},    // 统计湿度max/min
            temperature: {}, // 统计温度max/min
            openData: [],
            collisionData: [],
            crashData: []   //总的crash 数据
        };
        // morris
        $scope.info = {};
        $scope.lineModerationData = [];
        $scope.lineData = [];
        $scope.colors = ["#379DF2", "#F8B513"];
        $scope.initDate = function (x) {
            var date = new Date(x);
            var m = date.getMonth() + 1;
            m = m < 10 ? ('0' + m) : m;
            var d = date.getDate();
            d = d < 10 ? ('0' + d) : d;
            var h = date.getHours();
            var minute = date.getMinutes();
            minute = minute < 10 ? ('0' + minute) : minute;
            return m + '-' + d + ' ' + h + ':' + minute;
        };

        // page data
        $scope.getCrashInfo = function () {
            var p1 = {
                transferid: $scope.info.transferid,
                type: "open"
            };

            Http.get("/records2", p1).then(function (suc) {
                $scope.data.openData = suc;
                $scope.getCollisionData();
            }, function (fail) {

            });


        };
        $scope.getCollisionData = function () {
            var p2 = {
                transferid: $scope.info.transferid,
                type: "collision"
            };

            Http.get("/records2", p2).then(function (suc) {
                // init数组
                $scope.data.crashData = [];

                $scope.data.collisionData = suc;
                var oSize = $scope.data.openData.length;
                var cSize = $scope.data.collisionData.length;
                if (oSize > 0 || cSize > 0) {
                    var size = oSize > cSize ? oSize : cSize;
                    for (var i = 0; i < size; i++) {
                        $scope.data.crashData.push({
                            oInfo: $scope.data.openData[i] ? $scope.data.openData[i] : '--',
                            cInfo: $scope.data.collisionData[i] ? $scope.data.collisionData[i] : '--'
                        })
                    }
                } else {
                    $scope.data.crashData.push({
                        oInfo: '--',
                        cInfo: '--'
                    })
                }

            }, function (fail) {

            });
        };
        $scope.initData = function () {
            // $scope.info = Config.baseInfo;

            if ($scope.info.records.length < 1) {
                return;
            }

            $scope.getCrashInfo();

            // 湿度
            var data = [];
            var humidity = [];
            for (var i = 0; i < $scope.info.records.length; i++) {
                var temp = $scope.info.records[i];
                if (temp.humidity) {
                    humidity.push(parseInt(temp.humidity));
                    data.push({
                        y: temp.recordAt,
                        a: temp.humidity
                    })
                }
            }
            $scope.lineModerationData = data;
            if (humidity.length>0) {
                $scope.data.humidity.max = Common.arrMaxNum2(humidity) + "%";
                $scope.data.humidity.min = Common.arrMinNum2(humidity) + "%";
                $scope.data.humidity.avg = Common.arrAverageNum2(humidity) + "%";
            }

            // 温度
            var tData = [];
            var temperature = [];
            for (var j = 0; j < $scope.info.records.length; j++) {
                var item = $scope.info.records[j];
                // if (item.temperature && item.avgTemperature) {
                if (item.temperature) {
                    temperature.push(parseFloat(item.temperature));
                    // tData.push({y: item.recordAt, a: item.temperature, b: item.avgTemperature})
                    tData.push({y: item.recordAt, a: item.temperature})
                }
            }
            $scope.lineData = tData;
            if (temperature.length>0) {
                $scope.data.temperature.max = Common.arrMaxNum2(temperature) + "℃";
                $scope.data.temperature.min = Common.arrMinNum2(temperature) + "℃";
            }

            // 开始时间
            $scope.info.startAtShow = moment($scope.info.startAt).format('MM-DD HH:mm');
            // 获取器官时间
            $scope.info.getOrganAtShow = moment($scope.info.getOrganAt).format('YYYY-MM-DD HH:mm');

        };
        // $scope.initData();

        $scope.getShowtime = function (time) {
            if (time == '--') {
                return '--'
            } else {
                return moment(time).format('YYYY-MM-DD HH:mm');
            }
        };

        // fullPage
        $scope.mainOptions = {
            navigation: true,
            navigationPosition: 'right',
            scrollingSpeed: 1000
        };

        // diff
        var script = document.createElement('script');
        script.src = "http://webapi.amap.com/maps?v=1.3&key=6178b4ecd30a43f661ad2abf15f35595";
        document.head.appendChild(script);

        $scope.modalCheckBasicInfo = function () {
            if ($scope.data.modalPageIndex != 0) {
                $scope.data.modalPageIndex = 0;
                $('#baseInfo').addClass('btn-blue-solid');
                $('#sensorInfo').removeClass('btn-blue-solid');
            }
        };

        $scope.modalCheckDataInfo = function () {
            if ($scope.data.modalPageIndex != 1) {
                $scope.data.modalPageIndex = 1;
                $('#sensorInfo').addClass('btn-blue-solid');
                $('#baseInfo').removeClass('btn-blue-solid');
            }
        };

        // 定时器$scope.info
        $scope.beginTimer = function() {
            $scope.data.timer = $interval(function() {
                var params = {};
                if ($scope.info && $scope.info.records && $scope.info.records.length > 0) {
                    var params = {
                        transferid: $scope.info.transferid,
                        createAt: $scope.info.records[$scope.info.records.length - 1].createAt
                    };

                } else if ($scope.info) {
                    params = {
                        transferid: $scope.info.transferid,
                        createAt: "2000-01-01 00:00:00"
                    }

                } else {
                    return;
                }

                // 更新baseInfo
                Http.get("/records", params).then(function(data) {

                    for (var i = 0; i < data.length; i++) {
                        $scope.info.records.push(data[i]);
                    }
                    // 更新$scope数据
                    $scope.initData();

                }, function(msg) {

                });

            }, 180000); //间隔50秒定时执行
        };

        $scope.$on('destroy', function() {
            $interval.cancel($scope.timer);
        });

    }

})();