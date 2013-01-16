'user strict';
angular.module('admin.controllers', ['ngResource','ui']);

var GlobalCtrl = ['$scope', '$resource', '$location', '$window', '$routeParams', function($scope,$resource,$location,$window,$routeParams){
	$scope.window = $window
	, $scope.location = $location
	, $scope.resource = $resource
	, $scope.route = $routeParams
	, $scope.Math = $window.Math
	, $scope.Settings = $scope.resource('/resources/settings');
	$scope.Settings.get({}, function(settings){
		$scope.settings = settings
		, $scope.Users = $scope.resource('/resources/users/:user/:vote', {_csrf: settings.token})
		, $scope.Voters = $scope.resource('/resources/voters/:voter', {_csrf: settings.token}, {update: {method:'PUT'}});
		if ($scope.settings.modeState === false){
			return; 
		}
	});

	$scope.shareFB = function(){
		console.log('sharing facebook');
	}
}];

var MainCtrl = ['$scope', function($scope){
}];

var NomineesCtrl = ['$scope', function($scope){
	$scope.Users.query({}, function(response){
		$scope.users = response;
	});	
}];

var NomineeCtrl = ['$scope', function($scope){
	var userId = $scope.route.id;
	$scope.Users.get({user: userId}, function(resp){
		$scope.user = resp;
		$scope.Voters.query({voted_user: userId}, function(resp){
			$scope.voters = resp;
		});
	});
}];

var EditNomineeCtrl = ['$scope', function($scope){
	var userId = $scope.route.id;
	$scope.Users.get({user: userId}, function(resp){
		$scope.user = resp;
	});
}];

var VotersCtrl = ['$scope', function($scope){
	$scope.Voters.query({}, function(resp){
		$scope.voters = resp;
	});
}];