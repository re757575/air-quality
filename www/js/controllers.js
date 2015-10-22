// Ionic Starter Controllers
var app = angular.module('starter.controllers', []);

app.controller('homeCtrl', ['$scope', '$rootScope', '$location', '$ionicTabsDelegate', 'PushProcessingService', '$localstorage',
    function($scope, $rootScope, $location, $ionicTabsDelegate) {

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

            window.plugins.toast.showWithOptions({
                message: "再也不會收到最新空氣品質資訊",
                duration: "short",
                position: "bottom",
                addPixelsY: -200
            });
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
