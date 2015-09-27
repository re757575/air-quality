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

// http://intown.biz/2014/04/11/android-notifications/
//factory for processing push notifications.
angular.module('pushnotification', [])
   .factory('PushProcessingService', function() {
        function onDeviceReady() {
            console.info('NOTIFY  Device is ready.  Registering with GCM server');
            //register with google GCM server
            var pushNotification = window.plugins.pushNotification;
            pushNotification.register(gcmSuccessHandler, gcmErrorHandler, {'senderID': 'YOUR_PROJECT_NUMBER','ecb':'onNotificationGCM'});
        }
        function gcmSuccessHandler(result) {
            console.info('NOTIFY  pushNotification.register succeeded.  Result = '+result)
        }
        function gcmErrorHandler(error) {
            console.error('NOTIFY  '+error);
        }
        return {
            initialize : function () {
                console.info('NOTIFY  initializing');
                document.addEventListener('deviceready', onDeviceReady, false);
            },
            registerID : function (id) {
                // DOTO:
                //Insert code here to store the user's ID on your notification server.
                //You'll probably have a web service (wrapped in an Angular service of course) set up for this.
                //For example:
                // MyService.registerNotificationID(id).then(function(response){
                //     if (response.data.Result) {
                //         console.info('NOTIFY  Registration succeeded');
                //     } else {
                //         console.error('NOTIFY  Registration failed');
                //     }
                // });
            },
            //unregister can be called from a settings area.
            unregister : function () {
                console.info('unregister')
                var push = window.plugins.pushNotification;
                if (push) {
                    push.unregister(function () {
                        console.info('unregister success')
                    });
                }
            }
        }
    });

// ALL GCM notifications come through here.
function onNotificationGCM(e) {
    console.log('EVENT -> RECEIVED:' + e.event + '');
    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                console.log('REGISTERED with GCM Server -> REGID:' + e.regid + '');

                //call back to web service in Angular.
                //This works for me because in my code I have a factory called
                //      PushProcessingService with method registerID
                var elem = angular.element(document.querySelector('[ng-app]'));
                var injector = elem.injector();
                var myService = injector.get('PushProcessingService');
                myService.registerID(e.regid);
            }
            break;

        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if (e.foreground)
            {
                //we're using the app when a message is received.
                console.log('--INLINE NOTIFICATION--' + '');

                // if the notification contains a soundname, play it.
                var my_media = new Media('/android_asset/www/sound/'+ e.soundname);
                my_media.play();
                alert(e.payload.message);
            }
            else
            {
                // otherwise we were launched because the user touched a notification in the notification tray.
                if (e.coldstart)
                    console.log('--COLDSTART NOTIFICATION--' + '');
                else
                    console.log('--BACKGROUND NOTIFICATION--' + '');

                // direct user here:
                window.location = '#/tab/featured';
            }
            console.log('MESSAGE -> MSG: ' + e.payload.message + '');
            console.log('MESSAGE: '+ JSON.stringify(e.payload));
            break;

        case 'error':
            console.log('ERROR -> MSG:' + e.msg + '');
            break;

        default:
            console.log('EVENT -> Unknown, an event was received and we do not know what it is');
            break;
    }
}