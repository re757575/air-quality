// Ionic Starter Controllers
var app = angular.module('starter.controllers', []);

app.controller('homeCtrl', function($scope, $location, $ionicTabsDelegate) {
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

});

app.controller('settingsCtrl', function($scope, $stateParams, $ionicTabsDelegate) {
    $scope.citys = citys;

    $scope.goHome = function () {
        var selected = $ionicTabsDelegate.selectedIndex();
        if (selected != -1 && selected != 0) {
            $ionicTabsDelegate.select(selected - 1);
        }
    }
});

app.controller('airCtrl', function($scope, $stateParams, $http, $ionicLoading) {
    $scope.city = citys[$stateParams.id];

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    var param = {
        '$filter': "County eq '"+ $scope.city.q +"'",
        '$orderby': 'SiteName',
        '$skip': 0,
        '$top': 1000,
        'format': 'json',
        'callback': 'JSON_CALLBACK'
    };

    var paramStr = Object.keys(param).map(function(key) {
        return key + '=' + param[key];
    }).join('&');

    var url = encodeURI("http://opendata.epa.gov.tw/ws/Data/AQX/?"+ paramStr);

    $http.jsonp(url)
    .success(function (data, status, headers, config, statusText) {
        console.log(data);
        console.log(status);

        var imageBaseUrl = 'img/face-icon/48/';
        for (var i in data) {

            var PSI = data[i].PSI;
            var PM25 = data[i]['PM2.5'];

            if (PM25 === '') {
                data[i]['PM2.5'] = '通訊異常 或 設備維護';
            }

            if (PSI <= 50) {
                // 良好
                data[i]['img'] = imageBaseUrl + 'laughing-face.png';
            } else if (PSI >= 51 && PSI <= 100) {
                // 普通
                data[i]['img'] = imageBaseUrl + 'neutral-face.png';
            } else if (PSI >= 101 && PSI <= 199) {
                // 不良
                data[i]['img'] = imageBaseUrl + 'sad-face-eyebrows.png';
            } else if (PSI >= 200 && PSI <= 299) {
                // 非常不良
                data[i]['img'] = imageBaseUrl + 'angry-face.png';
            } else {
                // 有害
                data[i]['img'] = imageBaseUrl + 'angry-face-teeth.png';
            }
        }

        $scope.airList = data;
        $ionicLoading.hide();
    })
    .error(function(data, status) {
        console.log(data);
        console.log(status);
        $ionicLoading.hide();
        alert(status);

    });


  $scope.doRefresh = function() {

    var param = {
        '$filter': "County eq '"+ $scope.city.q +"'",
        '$orderby': 'SiteName',
        '$skip': 0,
        '$top': 1000,
        'format': 'json',
        'callback': 'JSON_CALLBACK'
    };

    var paramStr = Object.keys(param).map(function(key) {
        return key + '=' + param[key];
    }).join('&');

    var url = encodeURI("http://opendata.epa.gov.tw/ws/Data/AQX/?"+ paramStr);

    $http.jsonp(url)
    .success(function (data, status, headers, config, statusText) {
        console.log(data);
        console.log(status);

        var imageBaseUrl = 'img/face-icon/48/';
        for (var i in data) {

            var PSI = data[i].PSI;
            var PM25 = data[i]['PM2.5'];

            if (PM25 === '') {
                data[i]['PM2.5'] = '通訊異常 或 設備維護';
            }

            if (PSI <= 50) {
                // 良好
                data[i]['img'] = imageBaseUrl + 'laughing-face.png';
            } else if (PSI >= 51 && PSI <= 100) {
                // 普通
                data[i]['img'] = imageBaseUrl + 'neutral-face.png';
            } else if (PSI >= 101 && PSI <= 199) {
                // 不良
                data[i]['img'] = imageBaseUrl + 'sad-face-eyebrows.png';
            } else if (PSI >= 200 && PSI <= 299) {
                // 非常不良
                data[i]['img'] = imageBaseUrl + 'angry-face.png';
            } else {
                // 有害
                data[i]['img'] = imageBaseUrl + 'angry-face-teeth.png';
            }
        }

        $scope.airList = data;
        $ionicLoading.hide();
    })
    .error(function(data, status) {
        console.log(data);
        console.log(status);
        $ionicLoading.hide();
        alert(status);

    }).finally(function() {
       // Stop the ion-refresher from spinning
       $scope.$broadcast('scroll.refreshComplete');
    });

  };

});

var citys = [
    {name: "台北", q: "臺北市", on: true},
    {name: "台中", q: "臺中市", on: true},
    {name: "台南", q: "臺南市", on: true},
    {name: "高雄", q: "高雄市", on: true},
    {name: "花蓮", q: "花蓮縣", on: true},
];

console.log('starter.controllers');
