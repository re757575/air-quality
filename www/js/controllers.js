// Ionic Starter Controllers
var app = angular.module('starter.controllers', []);

app.controller('homeCtrl', function($scope, $location) {
    $scope.citys = citys;
    $scope.showWeather = function(index) {
        $location.path('/tab/home/'+index);
    };
});

app.controller('settingsCtrl', function($scope, $stateParams) {
    $scope.citys = citys;
});

app.controller('airCtrl', function($scope, $stateParams, $http) {
    $scope.city = citys[$stateParams.id];

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
    })
    .error(function(data, status) {
        console.log(data);
        console.log(status);
        alert(status);
    });
});

var citys = [
    {name: "台北", q: "臺北市", on: true},
    {name: "台中", q: "臺中市", on: true},
    {name: "台南", q: "臺南市", on: true},
    {name: "高雄", q: "高雄市", on: true},
    {name: "花蓮", q: "花蓮縣", on: true},
];

console.log('starter.controllers');
