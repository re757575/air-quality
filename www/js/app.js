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

app.run(function($rootScope, $ionicPlatform, $ionicHistory) {
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
    });
});
