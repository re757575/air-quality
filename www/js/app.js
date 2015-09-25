// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services']);

app.run(function($ionicPlatform) {
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
        url: '/tab/home/:id',
        templateUrl: 'templates/air.html',
        controller: 'airCtrl'
    });
});
