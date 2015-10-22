// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', [
      'ionic',
      'ionic.utils',
      'ionic.service.core',
      'ngCordova',
      'starter.controllers',
      'starter.services',
      'starter.config',
      'pushnotification'
    ]);

app.run(function($rootScope, $ionicPlatform, $ionicHistory, $cordovaDevice, $localstorage, PushProcessingService) {

  document.addEventListener("deviceready", function () {

    console.info('deviceready');
    // Get all device information.
    $rootScope.deviceInfo = $cordovaDevice.getDevice();

    // 紀錄關注設定
    var storage_citys = $localstorage.getObject('citys');

    if (Object.keys(storage_citys).length === 0) {
        $rootScope.citys = citys;
    } else {
        $rootScope.citys = storage_citys;
    }

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
      PushProcessingService.initialize();
    } else {
      console.log('reg_id 已註冊');
    }

    // 當使用者關閉推播且 app server 所回傳狀態不是 true, 則向 app server 註銷 reg_id
    if (storage_notifications['on'] === false && storage_notifications ['server_return'] !== true &&
        storage_reg_id !== undefined) {
        PushProcessingService.unregisterID(storage_reg_id);
    }

    // 當使用者開啟推播且 app server 所回傳狀態不是 true, 則向 app server 註冊 reg_id
    if (storage_notifications['on'] === true && storage_notifications ['server_return'] !== true &&
        storage_reg_id !== undefined) {
        PushProcessingService.registerID(storage_reg_id);
    }

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
    if ($rootScope.backButtonPressedOnceToExit) {
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

});

app.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
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
                controller: 'homeCtrl'
            }
        }
    })
    .state('tab.settings', {
        url: '/settings',
        views: {
            'tab-settings': {
                templateUrl: 'templates/settings.html',
                controller: 'settingsCtrl'
            }
        }
    })
    .state('air', {
        url: '/air/city/:id',
        templateUrl: 'templates/air.html',
        controller: 'airCtrl'
    })
    .state('setting-notifications', {
        url: '/setting-notifications',
        templateUrl: 'templates/setting-notifications.html',
        controller: 'settingsNotificationsCtrl'
    })
    .state('setting-city', {
        url: '/setting-city',
        templateUrl: 'templates/setting-city.html',
        controller: 'settingsCityCtrl'
    });
});

var citys = [
    {name: "台北", q: "臺北市", on: true},
    {name: "台中", q: "臺中市", on: true},
    {name: "台南", q: "臺南市", on: true},
    {name: "高雄", q: "高雄市", on: true},
    {name: "花蓮", q: "花蓮縣", on: true},
];
