(function () {
    'use strict';

    angular
        .module('air.controllers', [])
        .controller('HomeController', HomeController)
        .controller('SettingsController', SettingsController)
        .controller('SettingsCityController', SettingsCityController)
        .controller('SettingsNotificationsController', SettingsNotificationsController)
        .controller('AirController', AirController);

    HomeController.$inject = ['$scope', '$rootScope', '$location', '$ionicTabsDelegate', '$ionicPlatform', 'connection'];

    function HomeController($scope, $rootScope, $location, $ionicTabsDelegate, $ionicPlatform, connection) {

    document.addEventListener("deviceready", function () {
        var connectionStatus = connection.checkConnection();

        if (connectionStatus === 'No network connection') {
            navigator.notification.alert(
                '裝置目前無網路連線，請檢查網路狀態', // message
                 null, // callback
                '連線異常', // title
                '確認' // buttonName
            );
        }
    });

        $scope.goSettings = function () {
          var selected = $ionicTabsDelegate.selectedIndex();
          if (selected != -1) {
              $ionicTabsDelegate.select(selected + 1);
          }
        }
    }

    SettingsController.$inject = ['$scope', '$rootScope', '$ionicTabsDelegate'];

    function SettingsController($scope, $rootScope, $ionicTabsDelegate) {

        $scope.goHome = function () {
            var selected = $ionicTabsDelegate.selectedIndex();
            if (selected != -1 && selected != 0) {
                $ionicTabsDelegate.select(selected - 1);
            }
        };
    }

    SettingsCityController.$inject = ['$scope', '$rootScope', '$localstorage'];

    function SettingsCityController($scope, $rootScope, $localstorage) {

        $scope.change = function (citys) {
            $localstorage.setObject('citys', $rootScope.citys);
        };
    }

    SettingsNotificationsController.$inject = ['$scope', '$rootScope', '$localstorage', 'PushProcessingService'];

    function SettingsNotificationsController($scope, $rootScope, $localstorage, PushProcessingService) {

        $scope.change = function (notifications) {
            $localstorage.setObject('notifications', $rootScope.notifications);

            var reg_id = $localstorage.get('reg_id');
            var notifications = $rootScope.notifications['on'];

            if (undefined !== reg_id && notifications == false) {
                console.log('有 reg_id, 向 app server取消推播');
                PushProcessingService.unregisterID(reg_id);

                window.plugins.toast.showWithOptions({
                    message: "再也不會收到最新空氣品質資訊",
                    duration: "short",
                    position: "bottom",
                    addPixelsY: -200
                });
            }
            if (undefined !== reg_id && notifications == true) {
                console.log('有 reg_id, 向 app server 註冊推播');
                PushProcessingService.registerID(reg_id);
            }
            if (undefined === reg_id && notifications == true) {
                console.log('無 reg_id, 重新向 gcm & app server 註冊');
                PushProcessingService.getRegId();
            }
        };
    }

    AirController.$inject = ['$http', '$scope', '$stateParams', '$ionicLoading',
                             '$ionicScrollDelegate', 'getDataService', 'connection'];

    function AirController($http, $scope, $stateParams, $ionicLoading, $ionicScrollDelegate, getDataService, connection) {

        var citys = getDataService.ctiyLsit();

        $scope.city = citys[$stateParams.id];

        getDataService.loadData('AirQuality', {'city': $scope.city.q})
        .then(function(data) {

            if (data === 'timeout') {
                $scope.airList = [];
                window.plugins.toast.showWithOptions({
                    message: '連線逾時',
                    duration: "short",
                    position: "bottom",
                    addPixelsY: -200
                });
            } else {
                $scope.airList = data;
            }

        }, function(error) {
            $scope.airList = [];

            window.plugins.toast.showWithOptions({
                message: error.status,
                duration: "short",
                position: "bottom",
                addPixelsY: -200
            });

            console.log(error);

        }).finally(function() {
        });

        $scope.doRefresh = function() {

            getDataService.loadData('AirQuality', {'city': $scope.city.q})
            .then(function(data) {
                if (data === 'timeout') {
                    $scope.airList = [];
                    window.plugins.toast.showWithOptions({
                        message: '連線逾時',
                        duration: "short",
                        position: "bottom",
                        addPixelsY: -200
                    });
                } else {
                    $scope.airList = data;
                }
            }, function(error) {
                $scope.airList = [];

                window.plugins.toast.showWithOptions({
                    message: error.status,
                    duration: "short",
                    position: "bottom",
                    addPixelsY: -200
                });

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

})();
