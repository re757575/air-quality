// Ionic Starter Controllers
var app = angular.module('starter.controllers', []);

app.controller('homeCtrl',function($scope){
    $scope.stocks = stocklist;
});

app.controller('detailsCtrl',function($scope,$stateParams){
    $scope.stock = stocklist[$stateParams.sid];
});

var stocklist = [
    {id: 2330, name: '台積電', price: 147.0, PER: 14.44, PBR: 3.65,
        yield: 3.06, Desc: '晶圓製造', checked: false},
    {id: 1301, name: '台塑', price: 76.5, PER: 27.03, PBR: 1.7,
        yield: 2.22, Desc: '聚氯乙烯(PVC)、氯乙烯等塑膠製品', checked: false},
    {id: 2002, name: '中鋼', price: 25.8, PER: 18.04, PBR: 1.33,
        yield: 3.88, Desc: '鋼品設計製造買賣儲運及其他相關業務', checked: false},
    {id: 3045, name: '台灣大', price: 108.0, PER: 19.42, PBR: 6.13,
        yield: 5.19, Desc: '通訊業', checked: false},
    {id: 2454, name: '聯發科', price: 421.5, PER: 14.03, PBR: 2.68,
        yield: 3.56, Desc: '多媒體IC 、電腦週邊IC、其他IC', checked: false},
    {id: 2317, name: '鴻海', price: 93.1, PER: 10.52, PBR: 1.48,
        yield: 1.93, Desc: '電腦系統設備連接器等之開發設計製造', checked: false},
    {id: 3008, name: '大立光', price: 2695.0, PER: 18.6, PBR: 7.83,
        yield: 1.06, Desc: '各式光學鏡頭模組研發設計生產銷售', checked: false}
];

console.log('starter.controllers');
