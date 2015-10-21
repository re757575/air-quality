// Ionic Starter Controllers
var app = angular.module('starter.controllers', []);

app.controller('homeCtrl', ['$scope', '$rootScope', '$location', '$ionicTabsDelegate', 'PushProcessingService', '$localstorage',
    function($scope, $rootScope, $location, $ionicTabsDelegate, PushProcessingService, $localstorage) {

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
          $rootScope.notifications = notifications;
          $localstorage.setObject('notifications', notifications);
      } else {
          $rootScope.notifications = storage_notifications;
      }

      // 紀錄 reg_id
      var storage_reg_id = $localstorage.get('reg_id');

      if (storage_reg_id === undefined) {
        // 向 gcm & app server 註冊 red_id
        PushProcessingService.initialize();
      } else {
        console.log('storage_reg_id: '+ storage_reg_id);
      }

      $scope.goSettings = function () {
          var selected = $ionicTabsDelegate.selectedIndex();
          if (selected != -1) {
              $ionicTabsDelegate.select(selected + 1);
          }
      }
    }
]);

app.controller('settingsCtrl', function($scope, $rootScope, $stateParams, $ionicTabsDelegate) {

    $scope.goHome = function () {
        var selected = $ionicTabsDelegate.selectedIndex();
        if (selected != -1 && selected != 0) {
            $ionicTabsDelegate.select(selected - 1);
        }
    };
});

app.controller('settingsCityCtrl', function($scope, $rootScope, $stateParams, $localstorage) {

    $scope.change = function (citys) {
        $localstorage.setObject('citys', $rootScope.citys);
    };
});

app.controller('settingsNotificationsCtrl', function($scope, $rootScope, $stateParams, $localstorage, PushProcessingService) {

    $scope.change = function (notifications) {
        $localstorage.setObject('notifications', $rootScope.notifications);

        var reg_id = $localstorage.get('reg_id');
        var notifications = $rootScope.notifications['on'];

        if (undefined !== reg_id && notifications == false) {
            // 有 reg_id, 向 app server取消推播
            PushProcessingService.unregisterID(reg_id);
        }
        if (undefined !== reg_id && notifications == true) {
            // 有 reg_id, 向 app server 註冊推播
            PushProcessingService.registerID(reg_id);
        }
        if (undefined === reg_id && notifications == true) {
            // 無 reg_id, 重新向 gcm & app server 註冊
            PushProcessingService.initialize();
        }
    };
});

app.controller('airCtrl', ['$http', '$scope', '$stateParams', '$ionicLoading', '$ionicScrollDelegate', 'getDataService',
    function($http, $scope, $stateParams, $ionicLoading, $ionicScrollDelegate, getDataService) {

        $scope.city = citys[$stateParams.id];

        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0,
            template: '讀取中..'
        });

        getDataService.loadData('AirQuality', {'city': $scope.city.q})
        .then(function(data) {
            $scope.airList = data;
        }, function(error) {
            $scope.airList = [];
            alert('Error: '+ error.status);
            console.log(error);
        }).finally(function() {
            $ionicLoading.hide();
        });

        $scope.doRefresh = function() {
            getDataService.loadData('AirQuality', {'city': $scope.city.q})
            .then(function(data) {
                $scope.airList = data;
            }, function(error) {
                $scope.airList = [];
                alert('Error: '+ error.status);
                console.log(error);
            }).finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.doPulling = function(e) {};

        $scope.onRelease = function() {
            // 修正 Scroll top 未超過 -60, Scroll 文字未消失
            if ($ionicScrollDelegate.getScrollPosition().top > -60) {
                $('.scroll-refresher').removeClass('js-scrolling').addClass('invisible');
            }
        };
    }
]);

var citys = [
    {name: "台北", q: "臺北市", on: true},
    {name: "台中", q: "臺中市", on: true},
    {name: "台南", q: "臺南市", on: true},
    {name: "高雄", q: "高雄市", on: true},
    {name: "花蓮", q: "花蓮縣", on: true},
];

var notifications = {on: true};
