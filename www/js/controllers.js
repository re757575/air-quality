// Ionic Starter Controllers
var app = angular.module('starter.controllers', []);

app.controller('homeCtrl', ['$scope', '$location', '$ionicTabsDelegate', 'PushProcessingService',
    function($scope, $location, $ionicTabsDelegate, PushProcessingService) {
      $scope.citys = citys;
      $scope.showWeather = function(index) {
          $location.path('/tab/home/'+index);
      };

      $scope.goSettings = function () {
          var selected = $ionicTabsDelegate.selectedIndex();
          if (selected != -1) {
              $ionicTabsDelegate.select(selected + 1);
          }
      }
console.log(location.host);
      PushProcessingService.initialize();
    }
]);

app.controller('settingsCtrl', function($scope, $stateParams, $ionicTabsDelegate) {
    $scope.citys = citys;

    $scope.goHome = function () {
        var selected = $ionicTabsDelegate.selectedIndex();
        if (selected != -1 && selected != 0) {
            $ionicTabsDelegate.select(selected - 1);
        }
    }
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
