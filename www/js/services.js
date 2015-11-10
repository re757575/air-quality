(function () {
    'use strict';

    angular
        .module('ionic.utils', [])
        .factory('$localstorage', localstorageService)
        .factory('connection', connectionService);

    localstorageService.$inject = ['$window'];

    function localstorageService ($window) {
        return {
            set: function(key, value) {
                $window.localStorage[key] = value;
            },
            get: function(key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key) {
                return JSON.parse($window.localStorage[key] || '{}');
            },
            remove: function(key) {
                $window.localStorage.removeItem(key);
            }
        }
    }

    connectionService.$inject = [];

    function connectionService () {
        return {
            'checkConnection': checkConnection
        }

        function checkConnection() {

            // browser
            if (navigator.connection === undefined) {
                return 'browser debug';
            }

            var networkState = navigator.connection.type;

            var states = {};
            states[Connection.UNKNOWN]  = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet connection';
            states[Connection.WIFI]     = 'WiFi connection';
            states[Connection.CELL_2G]  = 'Cell 2G connection';
            states[Connection.CELL_3G]  = 'Cell 3G connection';
            states[Connection.CELL_4G]  = 'Cell 4G connection';
            states[Connection.CELL]     = 'Cell generic connection';
            states[Connection.NONE]     = 'No network connection';

            return states[networkState];
        }
    }

})();

(function () {
    'use strict';

    angular
        .module('air.services', [])
        .factory('getDataService', getDataService);

    getDataService.$inject = ['$rootScope', '$http', '$q', '$timeout', 'connection', '$ionicLoading', '$localstorage'];

    function getDataService ($rootScope, $http, $q, $timeout, connection, $ionicLoading, $localstorage) {
        var service = {
            url: 'http://opendata.epa.gov.tw/ws/Data/AQX/?',
            loadData: loadData,
            getMsg: getMsg
        };

        return service;

        function loadData(type, data) {
            var def = $q.defer();

            if (type === 'AirQuality') {

                var param = {
                    '$filter': "County eq '"+ data.city +"'",
                    '$orderby': 'SiteName',
                    '$skip': 0,
                    '$top': 1000,
                    'format': 'json',
                    'callback': 'JSON_CALLBACK'
                };

                var isGetAll = false;
                if (data.getAll !== undefined && data.getAll === true) {
                    isGetAll = true;
                    delete param['$filter'];
                }

                var paramStr = Object.keys(param).map(function(key) {
                    return key + '=' + param[key];
                }).join('&');

                var url = encodeURI(service.url + paramStr);

                $http.jsonp(url, {
                        timeout: def.promise,
                        transformRequest: function(data) {
                            console.log('request started');
                            console.log('connection type: '+ connection.checkConnection());
                            var connectionStatus = connection.checkConnection()
                            if (connectionStatus === 'No network connection') {
                                console.info('offline');
                                def.reject({'data': data, 'status': '裝置目前無網路連線，請檢查網路狀態'});
                                return def.promise;
                            }

                            $ionicLoading.show({
                                content: 'Loading',
                                animation: 'fade-in',
                                showBackdrop: true,
                                maxWidth: 200,
                                showDelay: 0,
                                template: '讀取中..'
                            });
                        },
                        transformResponse: function(data) {
                            console.log('request stopped');
                            $ionicLoading.hide();
                            return data;
                        }
                    })
                    .success(function (data, status, headers, config, statusText) {

                        var imageBaseUrl = 'img/face-icon/48/';
                        for (var i in data) {

                            var PSI = data[i].PSI;
                            var PM25 = data[i]['PM2.5'];

                            if (PM25 === '') {
                                data[i]['PM2.5'] = '通訊異常 或 設備維護';
                            }

                            if (PSI <= 50) {
                                // 良好
                                data[i]['img'] = imageBaseUrl + 'laughing-face.png';
                            } else if (PSI >= 51 && PSI <= 100) {
                                // 普通
                                data[i]['img'] = imageBaseUrl + 'neutral-face.png';
                            } else if (PSI >= 101 && PSI <= 199) {
                                // 不良
                                data[i]['img'] = imageBaseUrl + 'sad-face-eyebrows.png';
                            } else if (PSI >= 200 && PSI <= 299) {
                                // 非常不良
                                data[i]['img'] = imageBaseUrl + 'angry-face.png';
                            } else {
                                // 有害
                                data[i]['img'] = imageBaseUrl + 'angry-face-teeth.png';
                            }
                        }

                        if (isGetAll === true) {
                            var nowDate = new Date();
                            var formatDate = nowDate.getFullYear() +'-'+ nowDate.getMonth() +'-'+ nowDate.getDate() +' '
                                           + nowDate.getHours() +':'+ nowDate.getMinutes() +':'+ nowDate.getSeconds();

                            $localstorage.setObject('lastUpDate', {
                                'dateTime': formatDate,
                                'timestamp': nowDate.getTime()
                            });

                            $rootScope.lastUpDate = formatDate;
                        }

                        def.resolve(data);
                    }).error(function(data, status) {
                        $ionicLoading.hide();

                        if (status == '404') {
                            status = '裝置目前無網路連線，請檢查網路狀態'
                        };

                        def.reject({'data': data, 'status': status});
                });

                $timeout(function() {
                    def.resolve('timeout'); // this aborts the request!
                    $ionicLoading.hide();
                }, 15000);

                return def.promise;
            }
        }

        function getMsg() {

            var url = 'https://script.google.com/macros/s/AKfycbzVHkFnGLVJds6qRHvzg1kHWSWd8HIB1a-dEs_UVaCE6XGEqHi7/exec?callback=JSON_CALLBACK';

            $http.jsonp(url, {})
            .success(function (data, status) {
                console.info(data.result.msg);

                if (data.result.msg === 'null') {
                    return false;
                }

                navigator.notification.alert(
                    data.result.msg,
                    null,
                    '空氣品質警告',
                    '確認'
                );

            }).error(function(data, status) {
                console.info(data);
            });
        }

    }

})();

// https://github.com/phonegap/phonegap-plugin-push
// factory for processing push notifications.
(function () {
    'use strict';

    angular
        .module('pushnotification', [])
        .factory('PushProcessingService', PushProcessingService);

    PushProcessingService.$inject = ['$rootScope', '$http', '$ionicCoreSettings', 'appServerConfig', '$localstorage'];

    function PushProcessingService ($rootScope, $http, $ionicCoreSettings, appServerConfig, $localstorage) {

        var _config = appServerConfig; // private setting
        var gcm_key = $ionicCoreSettings.get('gcm_key'); // Your Project Number

        var pushNotServe = {
            pushConfig: pushConfig,
            initialize: initialize,
            getRegId: getRegId,
            registerID: registerID,
            unregisterID: unregisterID
        };

        return pushNotServe;

        function pushConfig() {
            var push = PushNotification.init({
                "android": {
                    "senderID": gcm_key,
                    "iconColor": "gray",
                    "forceShow": true
                },
                "ios": {"alert": "true", "badge": "true", "sound": "true"},
                "windows": {}
            });
            return push;
        }

        function initialize() {
            console.info('NOTIFY  initializing');
            onDeviceReady();
        }

        function getRegId() {
            var push = pushNotServe.pushConfig();
            push.on('registration', function(data) {
                console.log("registration event");
                console.info("Registering with GCM server");
                console.log(JSON.stringify(data));
                pushNotServe.registerID(data.registrationId);
            });
        }

        function registerID(id) {
            // Insert code here to store the user's ID on your notification server.
            console.log('registerID to App Server');

            var storage_notifications = $localstorage.getObject('notifications');
            storage_notifications['server_return'] = 'undefined';
            $localstorage.setObject('notifications', storage_notifications);

            var param = {
                'project_name_number': _config.APP_PROJECT_NAME +'-'+ gcm_key,
                'reg_id': id,
                'action': 'registerID',
                'callback': 'JSON_CALLBACK',
                'deviceInfo': JSON.stringify($rootScope.deviceInfo)
            }

            var paramStr = Object.keys(param).map(function(key) {
                return key + '=' + param[key];
            }).join('&');

            var url = _config.APP_SERVER_URL + paramStr;

            $http.jsonp(url, param).success(function(data) {
                var retStatus = data.result['status'];
                var retRegid = data.result['reg_id'];

                // 紀錄 server 回傳結果
                if (retStatus === 'success') {
                    storage_notifications['server_return'] = true;
                } else {
                    storage_notifications['server_return'] = false;
                }

                $rootScope.notifications = storage_notifications;
                $localstorage.setObject('notifications', $rootScope.notifications);
            });

            $localstorage.set('reg_id', id);
        }

        function unregisterID(id) {
            console.info('unregisterID to App Server');

            var storage_notifications = $localstorage.getObject('notifications');
            storage_notifications['server_return'] = 'undefined';
            $localstorage.setObject('notifications', storage_notifications);

            var param = {
                'reg_id': id,
                'action': 'unregisterID',
                'callback': 'JSON_CALLBACK',
            }

            var paramStr = Object.keys(param).map(function(key) {
                return key + '=' + param[key];
            }).join('&');

            var url = _config.APP_SERVER_URL + paramStr;

            var push = pushNotServe.pushConfig();

            // gcm server 會銷毀 reg_id, 但裝置重新註冊 reg_id 不會改變(需重新安裝?)
            // push.unregister(function(){console.log('successHandler');},
            //                 function(){console.log('errorHandler');});

            $localstorage.remove('reg_id');

            $http.jsonp(url, param).success(function(data) {
                var retStatus = data.result['status'];
                var retRegid = data.result['reg_id'];

                // 紀錄 server 回傳結果
                if (retStatus === 'success') {
                    storage_notifications['server_return'] = true;
                } else {
                    storage_notifications['server_return'] = false;
                }

                $rootScope.notifications = storage_notifications;
                $localstorage.setObject('notifications', $rootScope.notifications);
            });
        }

        function onDeviceReady() {

            console.info('NOTIFY  Device is ready');

            var push = pushNotServe.pushConfig();

            push.on('notification', function(data) {
                console.log("notification event");
                console.log(JSON.stringify(data));

                var my_media = new Media('/android_asset/www/sound/'+ data.sound);
                my_media.play();
            });

            push.on('error', function(e) {
                console.log("push error");
            });

            // 紀錄推播設定
            var storage_notifications = $localstorage.getObject('notifications');

            if (Object.keys(storage_notifications).length === 0) {
                $rootScope.notifications = {on: true, server_return: false}; // 預設值
                $localstorage.setObject('notifications', $rootScope.notifications);
            } else {
                $rootScope.notifications = storage_notifications;
            }

            // 紀錄 reg_id
            var storage_reg_id = $localstorage.get('reg_id');

            console.log('storage_reg_id: '+ storage_reg_id);

            if (storage_reg_id === undefined && $rootScope.notifications['on'] === true) {
              // 向 gcm & app server 註冊 red_id
                push.on('registration', function(data) {
                    console.log("registration event");
                    console.info("Registering with GCM server");
                    console.log(JSON.stringify(data));
                    pushNotServe.registerID(data.registrationId);
                });
            } else {
              console.log('reg_id 已註冊');
            }

            // 當使用者關閉推播且 app server 所回傳狀態不是 true, 則向 app server 註銷 reg_id
            if (storage_notifications['on'] === false && storage_notifications ['server_return'] !== true &&
                storage_reg_id !== undefined) {
                pushNotServe.unregisterID(storage_reg_id);
            }

            // 當使用者開啟推播且 app server 所回傳狀態不是 true, 則向 app server 註冊 reg_id
            if (storage_notifications['on'] === true && storage_notifications ['server_return'] !== true &&
                storage_reg_id !== undefined) {
                pushNotServe.registerID(storage_reg_id);
            }

        }

    }

})();
