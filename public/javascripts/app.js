'use strict'; 

angular.module('telmaCookies', ['ngResource', 'ui']).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
		when('/main', {templateUrl: '/views/Main.html', controller: MainCtrl, name:'Main'}).
		when('/stats', {templateUrl: '/views/Statistics.html', controller: StatsCtrl, name:'Statistics'}).
		when('/login', {templateUrl: '/views/Login.html', controller: LoginCtrl, name: 'Login'}).
		when('/vote/:id', {templateUrl: '/views/Vote.html', controller: VoteCtrl, name:'Vote'}).
		otherwise({redirectTo: '/main'});
}])