(function () {
    'use strict';

    angular
        .module('air', ['ionic', 'ionic.utils', 'ionic.service.core',
                        'ngCordova', 'air.controllers', 'air.services',
                        'air.config', 'pushnotification'])
        .run(runConfig)
        .config(routeConfig);

    runConfig.$inject = ['$rootScope', '$ionicPlatform', '$filter', '$ionicHistory', '$cordovaDevice',
                         '$localstorage', 'getDataService', 'PushProcessingService', 'connection', '$location'];

    function runConfig($rootScope, $ionicPlatform, $filter, $ionicHistory, $cordovaDevice, $localstorage, getDataService, PushProcessingService, connection, $location) {
        // 紀錄關注設定
        var storage_citys = $localstorage.getObject('citys');

        // 檢查時間,是否需要更新資料
        var nowDate = new Date();
        var haveToUpDate = false;
        var storage_lastUpDate = $localstorage.getObject('lastUpDate');
        if (Object.keys(storage_lastUpDate).length > 0) {
            var nowDateTime = nowDate.getTime();
            var lastUpDateTime = storage_lastUpDate.timestamp;
            haveToUpDate = ((nowDateTime - lastUpDateTime) >= 3600000) ? true : false;
        }

        if (Object.keys(storage_citys).length === 0 || Object.keys(storage_lastUpDate).length === 0 || haveToUpDate) {

            getDataService.loadData('AirQuality', {'getAll': true})
            .then(function(data) {

                if (data === 'timeout') {
                    window.plugins.toast.showWithOptions({
                        message: '連線逾時',
                        duration: "short",
                        position: "bottom",
                        addPixelsY: -200
                    });
                } else {
                    var citys = {},
                        citysSetting = {};

                    angular.forEach(data, function(value, key) {
                        var _c = value.County.slice(0,2);

                        if (this[_c] === undefined) {
                          this[_c] = [];
                          value['on'] = true;
                          this[_c].push(value);
                          citysSetting[_c] = {on: true};
                        } else {
                          value['on'] = true;
                          this[_c].push(value);
                        }

                    }, citys);

                    $rootScope.citys = citys;
                    $rootScope.citysSetting = citysSetting;
                    $localstorage.setObject('citys', citys);
                    $localstorage.setObject('citysSetting', citysSetting);

                    var formatDate = $filter('date')(nowDate, "yyyy-MM-dd HH:mm:ss");

                    $localstorage.setObject('lastUpDate', {
                        'dateTime': formatDate,
                        'timestamp': nowDate.getTime()
                    });
                    $rootScope.lastUpDate = formatDate;
                }

            }, function(error) {
                $rootScope.citys = [];
                $rootScope.citysSetting = [];

                window.plugins.toast.showWithOptions({
                    message: error.status,
                    duration: "short",
                    position: "bottom",
                    addPixelsY: -200
                });
                console.log(error);
            });

        } else {
            $rootScope.citys = storage_citys;
            $rootScope.citysSetting = $localstorage.getObject('citysSetting');
        }

        document.addEventListener("deviceready", function () {

            console.info('deviceready');
            // Get all device information.
            $rootScope.deviceInfo = $cordovaDevice.getDevice();

            $ionicPlatform.on('online', function() {
                var connectionStatus = connection.checkConnection();
                console.info('online');
                console.log('Connection type: '+ connectionStatus);
            });

            $ionicPlatform.on('offline', function() {});

            PushProcessingService.initialize();

        }, false);

        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if(window.StatusBar) {
            StatusBar.styleDefault();
            }

            // var isAndroid = ionic.Platform.isAndroid();
            // console.log('isAndroid: ' + isAndroid);

            // var deviceInformation = ionic.Platform.device();
            // console.log('deviceInformation: ' + deviceInformation);

            // var currentPlatform = ionic.Platform.platform();
            // var currentPlatformVersion = ionic.Platform.version();
            // console.log('currentPlatform:' + currentPlatform);
            // console.log('currentPlatformVersion:' + currentPlatformVersion);

            // ionic.Platform.exitApp();
        });

        // 註冊返回鍵
        $ionicPlatform.registerBackButtonAction(function(e) {

          e.preventDefault();

          if ($rootScope.backButtonPressedOnceToExit && $location.path() == '/tab/home') {
            // 離開App
            ionic.Platform.exitApp();
          } else if ($ionicHistory.backView()) {
            // 返回上一頁
            $ionicHistory.goBack();
            console.log('History Back');
          } else {
            // 提示再按一次退出,提示2秒
            $rootScope.backButtonPressedOnceToExit = true;
            // toast
            window.plugins.toast.showWithOptions(
              {
                message: "再按一次退出",
                duration: "short",
                position: "bottom",
                addPixelsY: -200  // added a negative value to move it up a bit (default 0)
              },
              function(a) {
                console.log('toast success: ' + a);
              },
              function(b) {
                console.log('toast error: ' + b);
              }
            );
            setTimeout(function() {
              $rootScope.backButtonPressedOnceToExit = false;
            }, 2000);
          }
          e.preventDefault();
          return false;
        }, 101);
    }

    routeConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider'];

    function routeConfig($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.tabs.position('bottom');
        $urlRouterProvider.otherwise('/tab/home');
        $stateProvider
          .state('tab', {
              url: '/tab',
              abstract: true,
              templateUrl: 'templates/tabs.html'
          })
          .state('tab.home', {
              url: '/home',
              views: {
                  'tab-home': {
                      templateUrl: 'templates/home.html',
                      controller: 'HomeController'
                  }
              }
          })
          .state('tab.settings', {
              url: '/settings',
              views: {
                  'tab-settings': {
                      templateUrl: 'templates/settings.html',
                      controller: 'SettingsController'
                  }
              }
          })
          .state('setting-city', {
              url: '/setting-city',
              templateUrl: 'templates/setting-city.html',
              controller: 'SettingsCityController'
          })
          .state('setting-notifications', {
              url: '/setting-notifications',
              templateUrl: 'templates/setting-notifications.html',
              controller: 'SettingsNotificationsController'
          })
          .state('air', {
              url: '/air/city/:id',
              templateUrl: 'templates/air.html',
              controller: 'AirController'
          })
    }

})();
