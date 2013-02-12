'use strict'; 

angular.module('telmaCookies', ['ngResource', 'ngCookies']).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
		when('/main', {templateUrl: '/views/Main.html', controller: MainCtrl, name:'Main'}).
		when('/chart', {templateUrl: '/views/Chart.html', controller: ChartCtrl, name:'Chart'}).
		when('/login', {templateUrl: '/views/Login.html', controller: LoginCtrl, name: 'Login'}).
		when('/guide', {templateUrl: '/views/Guide.html', controller: StaticCtrl, name:'Guide'}).
		when('/about', {templateUrl: '/views/About.html', controller: StaticCtrl, name:'About'}).
		when('/leaders', {templateUrl: '/views/Leaders.html?r='+Math.floor(Math.random()*10000), controller: StaticCtrl, name:'Leaders'}).
		when('/prizes', {templateUrl: '/views/Prizes.html' , controller: StaticCtrl, name:'Prizes'}).
		when('/thankyou', {templateUrl: '/views/Thankyou.html', controller: ThankyouCtrl, name:'Thankyou'}).
		otherwise({redirectTo: '/main'});
}])