'user strict';
angular.module('telmaCookies.controllers', ['ngResource','ui']);

var GlobalCtrl = ['$scope', '$resource', '$location', '$window', '$routeParams', function($scope,$resource,$location,$window,$routeParams){
	$scope.window = $window
	, $scope.location = $location
	, $scope.resource = $resource
	, $scope.route = $routeParams
	, $scope.Math = $window.Math
	, $scope.Settings = $scope.resource('/resources/settings')
	, $scope.Users = $scope.resource('/resources/users/:user/:vote')
	//, $scope.Votes = $scope.resource('/resources/votes/:user')
	, $scope.Voters = $scope.resource('/resources/voters/:voter', {}, {update: {method:'PUT'}});

	$scope.Settings.query({}, function(settings){
		$scope.settings = settings[0];
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
			console.log($scope.users);
		});
	});

	$scope.shareFB = function(){
		console.log('sharing facebook');
	}
}];

var MainCtrl = ['$scope', function($scope){
}];

var StatsCtrl = ['$scope', function($scope){
	// $scope.socket.on('updateStats', function(data){
	// 	$scope.$apply(function(){
	// 		$scope.users[data.user]['votes'] = data.votes;
	// 		$scope.totalVotes++;
	// 	});
	// });
}];

var VoteCtrl = ['$scope', function($scope){
	var userId = $scope.route.id;
	$scope.modalShown = false;
	
	$scope.Users.get({user: userId}, function(resp){
		//change global user
		$scope.user = resp;
		console.log($scope.user);
	});
	$scope.closeModal = function(){
		$scope.modalShown = false;
	}
	$scope.vote = function(id){
		$scope.Voters.save({}, {ref: '1234', voted_user: userId}, function(resp){
			$scope.vId = resp._id;
			$scope.Users.save({user:userId, vote: 'votes'}, {voterId: $scope.vId}, function(resp){
				console.log($scope.users);
				console.log(id);
				console.log($scope.users[id]);
				$scope.users[id].votes++;
				$scope.modalShown = true;
			});
		});
	}
}];

var RegisterCtrl = ['$scope', function($scope){
	$scope.registerObj = {};
	$scope.register = function(){
		$scope.registerForm.$valid = false;
		$scope.Voters.get({voter:$scope.vId}, function(doc){
			doc.slogan = $scope.registerObj.slogan;
			doc.name = $scope.registerObj.name;
			doc.email = $scope.registerObj.email
			doc.phone = $scope.registerObj.phone;
			doc.$update({voter: doc._id}, function(u,c){
				$scope.closeModal();
				$scope.shareFB();
			});
		});
	}
}];

var ChartCtrl = ['$scope', function($scope){
	$scope.chartCategories = [];
	$scope.chartData = [];
	console.log($scope.users);
	for (var key in $scope.users) {
		$scope.chartCategories.push($scope.users[key].name);
		$scope.chartData.push($scope.users[key].votes);
	}
	$scope.chartStep = 1;
	$scope.chartName = '';
	$scope.$watch('users', function(){
		console.log('users data changed');
	})
}];