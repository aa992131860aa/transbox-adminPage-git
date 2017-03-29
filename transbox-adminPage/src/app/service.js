(function() {
	'use strict';

	angular.module('HttpService', [])
		.service("Utils", utils)
		.service("Http", http)
		.service("Common", common);



	// by xiyangyang begin
	function common() {
		return {
			attr: function(id) {
				$('#' + id).attr("readonly", "readonly");
				$('#' + id).attr("disabled", "disabled");
			},
			removeAttr: function(id) {
				$('#' + id).removeAttr("readonly", "readonly");
				$('#' + id).removeAttr("disabled", "disabled");
			},
			Validate_checkphone: function(phone) {
				var reg = /^(1)[\d]{10}$/;
				if (!reg.test(phone)) {
					return false;
				} else {
					return true;
				}
			},
			arrMaxNum2: function arrMaxNum2(arr) {
				return Math.max.apply(null, arr);
			},
			arrMinNum2: function arrMinNum2(arr) {
				return Math.min.apply(null, arr);
			},
			arrAverageNum2: function arrAverageNum2(arr) {
				var sum = eval(arr.join("+"));
				// return ~~(sum / arr.length * 100) / 100;
				return (~~(sum / arr.length * 100) / 100).toFixed(2);
			}
		}
	}

	// by xiyangyang end

	function utils($q) {
		return {
			promiseHttpResult: function(httpPromise) {
				var deferred = $q.defer();
				httpPromise.success(function(response) {
					if (response.status === 'OK') {
						deferred.resolve(response.data);

					} else if (response.status === 'failed' && response.error) {
						var msg = response.error;
						deferred.reject(msg);

					} else {
						var msg = "很抱歉，无法从服务器获取数据。";
						deferred.reject(msg);
					}

				}).error(function(err) {
					var msg = "很抱歉，无法从服务器获取数据。";
					deferred.reject(msg);
				});

				return deferred.promise;
			}
		};
	}

	function http($http, $rootScope, Utils) {
		//local host
		 var host = "http://192.168.1.115:1337/transbox/api";
		//release host
		//var host = "http://www.lifeperfusor.com/transbox/api";

		return {
			host: host,
			get: function(path, params) {
				params = params || {};
				params.timestamp = new Date().getTime();
				return Utils.promiseHttpResult($http({
					method: 'GET',
					url: host + path,
					params: params,
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					}
				}));
			},
			post: function(path, params) {
				params = params || {};
				params.timestamp = new Date().getTime();

				return Utils.promiseHttpResult($http({
					method: 'POST',
					url: host + path,
					data: $.param(params),
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					}
				}));
			},
			put: function(path, params) {
				params = params || {};
				params.timestamp = new Date().getTime();

				return Utils.promiseHttpResult($http({
					method: 'PUT',
					url: host + path,
					data: $.param(params),
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					}
				}));
			},
			getDate: function(times) {
				var date = new Date(parseInt(times));
				var y = date.getFullYear();
				var m = date.getMonth() + 1;
				m = m < 10 ? ('0' + m) : m;
				var d = date.getDate();
				d = d < 10 ? ('0' + d) : d;
				var h = date.getHours();
				var minute = date.getMinutes();
				minute = minute < 10 ? ('0' + minute) : minute;
				return y + '-' + m + '-' + d;
			}
		};

	}

})();