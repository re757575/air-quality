(function () {
    'use strict';

    angular
        .module('air', ['ionic', 'ionic.utils', 'ionic.service.core',
                        'ngCordova', 'air.controllers', 'air.services',
                        'air.config', 'pushnotification'])
        .run(runConfig)
        .config(routeConfig);

    runConfig.$inject = ['$rootScope', '$ionicPlatform', '$ionicHistory', '$cordovaDevice',
                         '$localstorage', 'getDataService', 'PushProcessingService', 'connection', '$location'];

    function runConfig($rootScope, $ionicPlatform, $ionicHistory, $cordovaDevice, $localstorage, getDataService, PushProcessingService, connection, $location) {
        // 紀錄關注設定
        var storage_citys = $localstorage.getObject('citys');

        if (Object.keys(storage_citys).length === 0) {
            $rootScope.citys = getDataService.ctiyLsit();
        } else {
            $rootScope.citys = storage_citys;
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
