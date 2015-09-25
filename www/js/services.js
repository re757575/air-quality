'use strict';

angular.module('starter.services', []).
    factory('getDataService', ['$http', '$q',  function($http, $q) {

        var service = {
            url: 'http://opendata.epa.gov.tw/ws/Data/AQX/?',
            loadData: loadData
        };

        return service;

        function loadData(type, data) {
            var def = $q.defer();

            if (type === 'AirQuality') {

                var param = {
                    '$filter': "County eq '"+ data.city +"'",
                    '$orderby': 'SiteName',
                    '$skip': 0,
                    '$top': 1000,
                    'format': 'json',
                    'callback': 'JSON_CALLBACK'
                };

                var paramStr = Object.keys(param).map(function(key) {
                    return key + '=' + param[key];
                }).join('&');

                var url = encodeURI(service.url + paramStr);

                $http.jsonp(url)
                    .success(function (data, status, headers, config, statusText) {

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
                        def.resolve(data);
                    }).error(function(data, status) {
                        def.reject({'data': data, 'status': status});
                });
                return def.promise;
            }
        };

}]);