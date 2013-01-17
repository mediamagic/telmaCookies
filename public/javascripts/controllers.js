'user strict';
angular.module('telmaCookies.controllers', ['ngResource','ui','ngCookies']);

var GlobalCtrl = ['$scope', '$resource', '$location', '$window', '$routeParams', '$cookies', function($scope,$resource,$location,$window,$routeParams,$cookies){
	$scope.window = $window
	, $scope.location = $location
	, $scope.resource = $resource
	, $scope.route = $routeParams
	, $scope.Math = $window.Math
	, $scope.Settings = $scope.resource('/resources/settings')
	$scope.Settings.get({}, function(settings){
		$scope.settings = settings
		, $scope.Users = $scope.resource('/resources/users/:user/:vote', {_csrf: $cookies['csrf.token']})
		, $scope.Voters = $scope.resource('/resources/voters/:voter', {_csrf: $cookies['csrf.token']}, {update: {method:'PUT'}})
		, $scope.Stats = $scope.resource('/resources/stats/:type', {_csrf: $cookies['csrf.token']});
		$scope.ref = ($scope.location.$$search.ref || 0);
		if ($scope.settings.modeState === false){
			return; 
		}
		$scope.Users.query({}, function(response){
			var newObj = {}
			, totalVotes = 0;
			for(var i=0;i<response.length;i++){
				newObj[response[i]._id] = response[i];
				totalVotes = totalVotes + response[i].votes;
			}
			$scope.users = newObj;
			$scope.totalVotes = totalVotes;
		});
		$scope.stats('visit', $scope.ref);
	});
	$scope.shareFB = function(type){
		console.log('sharing facebook');
		$scope.stats('share', type);
	}

	$scope.stats = function(metric, type){
		$scope.Stats.save({type:metric}, {ref: type}, function(response){
			console.log(response);
		});
	}
}];

var MainCtrl = ['$scope', function($scope){
}];

var ChartCtrl = ['$scope', function($scope){
	$scope.Users.query({}, function(response){
		var newObj = {}
		, totalVotes = 0;
		for(var i=0;i<response.length;i++){
			newObj[response[i]._id] = response[i];
			totalVotes = totalVotes + response[i].votes;
		}
		$scope.users = newObj;
		$scope.totalVotes = totalVotes;
	});
}];

var VoteCtrl = ['$scope', function($scope){
	$scope.registerObj = {
		ref: $scope.ref
	};
	$scope.register = function(){
		$scope.Voters.save({}, $scope.registerObj, function(resp){
			$scope.vId = resp._id;
			$scope.Users.save({user:$scope.registerObj.voted_user, vote: 'votes'}, {voterId: $scope.vId}, function(resp){
				var voted_user_id = $scope.registerObj.voted_user;
				$scope.users[voted_user_id].votes++;
				$scope.shareFB($scope.users[voted_user_id].name);
			});
		});
	}
}];

var LoginCtrl = ['$scope', function($scope){
	var prevUrl = $scope.location.$$search.url;
	$scope.loginSubmit = function(){
		$scope.Login = $scope.resource('/api/login', {_csrf: $scope.settings.token});
		$scope.Login.save({}, {username: $scope.username, password: $scope.password}, function(resp){
			if (resp.error === undefined){
				console.log($scope.window);
				(prevUrl === undefined) ? $scope.location.path('/admin') : $scope.window.location.href = prevUrl;
				console.log($scope.location);
			}
		});
	}
}];