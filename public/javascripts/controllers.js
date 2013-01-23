'user strict';
angular.module('telmaCookies.controllers', ['ngResource','ngCookies']);

var GlobalCtrl = ['$scope', '$resource', '$location', '$window', '$routeParams', '$cookies', '$route', function($scope,$resource,$location,$window,$routeParams,$cookies,$route){
	$scope.Settings = $resource('/resources/settings')
	, $scope.location = $location
	, $scope.resource = $resource
	, $scope.route = $routeParams
	, $scope.Math = $window.Math;

	$scope.Settings.get({}, function(settings){
		$scope.settings = settings
		, $scope.Users = $scope.resource('/resources/users/:user/:vote', {_csrf: $cookies['csrf.token']})
		, $scope.Voters = $scope.resource('/resources/voters/:voter', {_csrf: $cookies['csrf.token']}, {update: {method:'PUT'}})
		, $scope.Stats = $scope.resource('/resources/stats/:type', {_csrf: $cookies['csrf.token']})
		, $scope.Login = $scope.resource('/api/login', {_csrf: $cookies['csrf.token']});
		$scope.ref = ($scope.location.$$search.ref || 0);
		if ($scope.settings.modeState === false){
			delete $route.routes['/vote'];
			return; 
		}
		$scope.Users.query({}, function(response){
			var random = Math.floor((Math.random()*3000)/1000)
			console.log(random);
			$scope.videoId = response[random].videoId
			$scope.thumbs = response;
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

var IntroCtrl = ['$scope', function($scope, $location){
	var fr1 = new Image();
	var fr2 = new Image();
	var fr3 = new Image();
	var fr4 = new Image();
	var iw = document.getElementById('introWrapper');
	fr4.onload = function(){
		iw.innerHTML = '';
		iw.appendChild(fr4)
		window.location.href = "#/main";
	}
	fr3.onload = function(){
		iw.innerHTML = ''; 
		iw.appendChild(fr3)
		setTimeout(function(){
			fr4.src='../images/intro_4.jpg'	
		}, 1000);
	}
	fr2.onload = function(){
		iw.innerHTML = ''; 
		iw.appendChild(fr2)
		setTimeout(function(){
			fr3.src='../images/intro_3.jpg'
		}, 1000);
	}	
	fr1.onload = function(){
		iw.appendChild(fr1);
		setTimeout(function(){
			fr2.src='../images/intro_2.jpg';
		}, 1000);
	}
	fr1.src = '../images/intro_1.jpg';
}];

var MainCtrl = ['$scope', function($scope){
	$scope.setVideo = function(index){
		$scope.videoId = $scope.thumbs[index].videoId;
	}
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
		for (var user in $scope.users){
			$scope.users[user].height = Math.round(($scope.users[user].votes / $scope.totalVotes ) * 320);
		}
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
		$scope.Login.save({}, {username: $scope.username, password: $scope.password}, function(resp){
			if (resp.error === undefined){
				(prevUrl === undefined) ? $scope.location.path('/admin') : $scope.window.location.href = prevUrl;
			}
		});
	}
}];

var StaticCtrl = ['$scope', function($scope){
	
}];