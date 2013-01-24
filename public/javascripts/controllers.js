'user strict';
angular.module('telmaCookies.controllers', ['ngResource','ngCookies']);

var GlobalCtrl = ['$scope', '$resource', '$location', '$window', '$routeParams', '$cookies', '$route', function($scope,$resource,$location,$window,$routeParams,$cookies,$route){
	$scope.Settings = $resource('/resources/settings')
	$scope.location = $location
	$scope.resource = $resource
	$scope.route = $routeParams
	$scope.Math = $window.Math
	$scope.glob = {
		lastRegister: {},
		mode: 'main'
	}
	$scope.dict = {'suspense': 15028,'scifi': 15029,'comedy': 15030,'comedy Autoplay': 15031,'suspense Autoplay': 15032,'scifi Autoplay':  15033,'HP': 15036,'Vote Now': 15037,
					'SEND': 15038,'Results': 15039,'COCOMAN Cookies': 15040,'Awards': 15041,'HOW TO': 15042,'WINNERS': 15043,'FACEBOOK': 15044,'Share comedy': 15045,
					'Share suspense': 15046,'Share scifi': 15047,'Share vote': 15048};
	$scope.shareFB = function(type){
		var root = $window.location.protocol 
				+ '//' +$window.location.host;
		var obj = {
			method: 'feed',
			link: root
		};
		if (type != 'vote') {
			for (var key in $scope.users) {
				if ($scope.users[key].name === type)
					var uKey = key;
			}
			obj.picture = root + '/images/cookie_'+type+'.png';
			obj.name = $scope.users[uKey].facebook.shareTitle;
			obj.description = $scope.users[uKey].facebook.shareText;
		} else {
			obj.picture = root + '/images/cookie_comedy.png';
			obj.name  = $scope.settings.facebook.shareTitle;
			obj.description = $scope.settings.facebook.shareText;
		}
		FB.ui(obj, function(response) {
			$scope.track('Share ' + type);
			$scope.stats('share', type);
		});
	}
	$scope.stats = function(metric, type){
		$scope.Stats.save({type:metric}, {ref: type}, function(response){
			console.log(response);
		});
	}
	$scope.track = function(action){
		console.log('tracking: ' + action);
		var img = new Image;
		img.onload = function(){
			console.log('pixel: ' + $scope.dict[action]);
			delete this;
		}
		img.src = "http://adserver.adtech.de/utrack/3.0/1391/0/0/0/BeaconId="
		+$scope.dict[action]+";rettype=img;subnid=1;Section=[Please insert Section here]";
		return $window._gaq.push(['_trackPageview', action]);
	}
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
			$scope.videoId = response[random].videoId
			$scope.track(response[random].name + ' Autoplay');
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
}];

var MainCtrl = ['$scope', function($scope){
	$scope.glob.mode='main';
	$scope.track('HP');
	$scope.setVideo = function(index){
		$scope.videoId = $scope.thumbs[index].videoId;
		$scope.track($scope.thumbs[index].name);
	}
}];

var ChartCtrl = ['$scope', function($scope){
	$scope.glob.mode='pop';
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
	$scope.itemStyle = function (item, style) {
		var obj = {}
	    obj[style] = $scope.users[item].height + 'px';
	    return obj;
	};
}];

var VoteCtrl = ['$scope', function($scope){
	$scope.registerObj = $scope.glob.lastRegister
	, $scope.registerObj.ref = $scope.ref
	, $scope.glob.mode='pop';
	$scope.register = function(){
		$scope.Voters.save({}, $scope.registerObj, function(resp){
			$scope.vId = resp._id;
			$scope.Users.save({user:$scope.registerObj.voted_user, vote: 'votes'}, {voterId: $scope.vId}, function(resp){
				var voted_user_id = $scope.registerObj.voted_user;
				delete $scope.registerObj.voted_user;
				$scope.track('SEND');
				$scope.users[voted_user_id].votes++;
				$scope.glob.lastRegister = $scope.registerObj;
				$scope.location.path('/thankyou');
			});
		});
	}
}];

var LoginCtrl = ['$scope', function($scope){
	var prevUrl = $scope.location.$$search.url;
	$scope.glob.mode='pop';
	$scope.loginSubmit = function(){
		$scope.Login.save({}, {username: $scope.username, password: $scope.password}, function(resp){
			if (resp.error === undefined){
				(prevUrl === undefined) ? $scope.location.path('/admin') : $scope.window.location.href = prevUrl;
			}
		});
	}
}];

var StaticCtrl = ['$scope', function($scope){
	$scope.glob.mode='pop';
}];

var ThankyouCtrl = ['$scope', function($scope){
	$scope.glob.mode='pop';
	$scope.close = function(id){
		$scope.shareFB(id);
	}
}];