(function() {
    'use strict';

    angular.module('ConfigFactory', [])
        .factory('Config', config);

    function config($rootScope) {
        return {
            apiPath: {
                transfers: '/transfers',
                hospitals: '/hospitals',
                hospital: '/hospital',
                opos: '/opos',
                opo: '/opo',
                boxes: '/boxes',
                box: '/box',
                fittings: '/fittings',
                fitting: '/fitting',
                keywords: '/keywords',
                keyword: '/keyword',
                account: '/account'
            },
            getCookie: function(c_name) {
                if (document.cookie.length > 0) {
                    var c_start = document.cookie.indexOf(c_name + "=");
                    if (c_start != -1) {
                        c_start = c_start + c_name.length + 1;
                        var c_end = document.cookie.indexOf(";", c_start);
                        if (c_end == -1) c_end = document.cookie.length;
                        return unescape(document.cookie.substring(c_start, c_end));
                    }
                }
                return "";
            },
            setCookie: function(c_name, value, expiredays) {
                var exdate = new Date();
                exdate.setDate(exdate.getDate() + expiredays);
                document.cookie = c_name + "=" + escape(value) +
                    ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
            },
            removeCookie: function(name) {
                document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            },
            getFormatStringFromDate: function(date) {
                if (!date || !date.getMonth()) {
                    return null;
                }

                var year = date.getFullYear();
                var month = (date.getMonth() + 1) >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
                var day = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();

                return year + '-' + month + '-' + day;
            },
            getDateStringFromObject: function(obj) {
                if (!obj) {
                    return null;
                }

                if (typeof(obj) === 'string') {
                    var arr = obj.split(' ');
                    if (arr && arr.length > 0) {
                        return arr[0];
                    }

                    return null;

                } else if (obj.getDate()) {
                    var year = obj.getFullYear();
                    var month = (obj.getMonth() + 1) >= 10 ? obj.getMonth() + 1 : '0' + (obj.getMonth() + 1);
                    var day = obj.getDate() >= 10 ? obj.getDate() : '0' + obj.getDate();

                    return year + '-' + month + '-' + day;

                }else {
                    return null;
                }
            },
            userInfo: {},
            getDateObjFromString: function(str) {
                if (!str || str.length < 1) {
                    return str;
                }

                str = str.replace(' ', 'T');
                str = str.concat('Z');
                return (new Date(str));
            },
        }
    }

})();