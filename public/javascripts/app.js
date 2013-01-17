'use strict'; 

angular.module('telmaCookies', ['ngResource', 'ui', 'ngCookies']).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
		when('/main', {templateUrl: '/views/Main.html', controller: MainCtrl, name:'Main'}).
		when('/chart', {templateUrl: '/views/Chart.html', controller: ChartCtrl, name:'Chart'}).
		when('/login', {templateUrl: '/views/Login.html', controller: LoginCtrl, name: 'Login'}).
		when('/vote', {templateUrl: '/views/Vote.html', controller: VoteCtrl, name:'Vote'}).
		otherwise({redirectTo: '/main'});
}])