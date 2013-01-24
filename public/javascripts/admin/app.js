'use strict'; 

angular.module('admin', ['ngResource','ngCookies']).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
		when('/main', {templateUrl: '/views/admin/Main.html', controller: MainCtrl, name:'Main'}).
		when('/nominees', {templateUrl: '/views/admin/Nominees.html', controller: NomineesCtrl, name:'nominees'}).
		when('/nominee/:id', {templateUrl: '/views/admin/Nominee.html', controller: NomineeCtrl, name:'nominee'}).
		when('/settings', {templateUrl: '/views/admin/Settings.html', controller: SettingsCtrl, name:'settings'}).
		when('/nominee/:id/settings', {templateUrl: '/views/admin/EditNominee.html', controller: EditNomineeCtrl, name:'nominee'}).
		when('/voters', {templateUrl: '/views/admin/Voters.html', controller: VotersCtrl, name:'Statistics'}).
		otherwise({redirectTo: '/main'});
}])