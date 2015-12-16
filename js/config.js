/** 
 * Date 20151026
 * File Path /www/js/config.js
 */
(function () {
    'use strict';

    angular
        .module('air.config', [])
        .factory('appServerConfig', appServerConfig);

    appServerConfig.$inject = ['$q'];

    function appServerConfig($q) {
        var _config = {
            APP_SERVER_URL: 'https://script.google.com/macros/s/AKfycbyx3sVSLM7226sZMXgdydkR7L97FgidihNj4YT-JMn_Bw4M7J0/exec?',
            APP_PROJECT_NAME: 'AirQuality-App'
        };
        return _config;
    }

})();
