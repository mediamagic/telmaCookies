'use strict'; 

angular.module('admin', ['ngResource', 'ui']).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
		when('/main', {templateUrl: '/views/admin/Main.html', controller: MainCtrl, name:'Main'}).
		when('/nominees', {templateUrl: '/views/admin/Nominees.html', controller: NomineeCtrl, name:'Statistics'}).
		when('/voters', {templateUrl: '/views/admin/Voters.html', controller: VotersCtrl, name:'Statistics'}).
		otherwise({redirectTo: '/main'});
}])