(function () {
    'use strict';

    angular
        .module('air.controllers', [])
        .controller('HomeController', HomeController)
        .controller('SettingsController', SettingsController)
        .controller('SettingsCityController', SettingsCityController)
        .controller('SettingsNotificationsController', SettingsNotificationsController)
        .controller('AirController', AirController);

    HomeController.$inject = ['$scope', '$rootScope', '$filter', '$ionicTabsDelegate',
                              '$ionicScrollDelegate', '$ionicPlatform', 'connection', '$localstorage', 'getDataService'];

    function HomeController($scope, $rootScope, $filter, $ionicTabsDelegate, $ionicScrollDelegate, $ionicPlatform, connection, $localstorage, getDataService) {

        document.addEventListener("deviceready", function () {
            var connectionStatus = connection.checkConnection();

            if (connectionStatus === 'No network connection') {
                navigator.notification.alert(
                    '裝置目前無網路連線，請檢查網路狀態', // message
                     null, // callback
                    '連線異常', // title
                    '確認' // buttonName
                );
            } else {
                getDataService.getMsg();
            }
        });

        var lastUpDate = $localstorage.getObject('lastUpDate');
        if (Object.keys(lastUpDate).length !== 0) {
            $scope.lastUpDate = lastUpDate.timestamp;
        }

        $scope.goSettings = function () {
          var selected = $ionicTabsDelegate.selectedIndex();
          if (selected != -1) {
              $ionicTabsDelegate.select(selected + 1);
          }
        }

        $scope.doRefresh = function() {

            var storage_citysSetting = $localstorage.getObject('citysSetting');

            getDataService.loadData('AirQuality', {'getAll': true})
            .then(function(data) {
                if (data === 'timeout') {
                    $scope.airList = [];
                    window.plugins.toast.showWithOptions({
                        message: '連線逾時',
                        duration: "short",
                        position: "bottom",
                        addPixelsY: -200
                    });
                } else if (data === 'cancelled') {
                    console.info('request abort');
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

                            // 有設定,則不蓋過
                            if (Object.keys(storage_citysSetting).length !== 0) {
                                citysSetting[_c] = {'on': storage_citysSetting[_c].on};
                            }

                        } else {
                          value['on'] = true;
                          this[_c].push(value);
                        }

                    }, citys);

                    var nowDate = new Date();
                    var formatDate = $filter('date')(nowDate, "yyyy-MM-dd HH:mm:ss");

                    $rootScope.citys = citys;
                    $rootScope.citysSetting = citysSetting;
                    $localstorage.setObject('citys', citys);
                    $localstorage.setObject('citysSetting', citysSetting);

                    $localstorage.setObject('lastUpDate', {
                        'dateTime': formatDate,
                        'timestamp': nowDate.getTime()
                    });
                    $scope.lastUpDate = formatDate;
                }
            }, function(error) {

                window.plugins.toast.showWithOptions({
                    message: '資料取得失敗: '+ error.status,
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

        $scope.change = function (citysSetting) {
            $localstorage.setObject('citysSetting', $rootScope.citysSetting);
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
                             '$ionicScrollDelegate', 'getDataService', 'connection', '$localstorage'];

    function AirController($http, $scope, $stateParams, $ionicLoading, $ionicScrollDelegate, getDataService, connection, $localstorage) {

        var city = decodeURI($stateParams.id);

        var storage_citys = $localstorage.getObject('citys');

        if (Object.keys(storage_citys).length === 0) {
            $scope.airList = [];
        } else {
            $scope.airList = storage_citys[city];
        }

        $scope.city = city;

        console.log(city);
        console.log($scope.airList);

        $scope.doRefresh = function() {

            var nowPageCity = $scope.airList[0].County;

            getDataService.loadData('AirQuality', {'city': nowPageCity})
            .then(function(data) {
                if (data === 'timeout') {
                    $scope.airList = [];
                    window.plugins.toast.showWithOptions({
                        message: '連線逾時',
                        duration: "short",
                        position: "bottom",
                        addPixelsY: -200
                    });
                } else if (data === 'cancelled') {
                    console.info('request abort');
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

        $scope.click = function(e) {
            var url = 'http://taqm.epa.gov.tw/taqm/tw/PsiMap.aspx';
            var ref = cordova.InAppBrowser.open(url, '_blank', 'location=no');
        };
    }

})();
