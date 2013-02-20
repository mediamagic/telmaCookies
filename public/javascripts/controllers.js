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
	$scope.dict = {'suspense': 'Thriller','scifi': 'Science fiction','comedy': 'Comedy','comedy Autoplay': 'Comedy Autoplay','suspense Autoplay': 'Thriller Autoplay','scifi Autoplay': 'Science fiction Autoplay','HP': 'HP','Vote Now': 'Vote Now',
					'SEND': 'SEND','Results': 'Results','COCOMAN Cookies': 'Cocoman Cookies','Awards': 'Awards','HOW TO': 'HOW TO','WINNERS': 'WINNERS','FACEBOOK': 'FACEBOOK','Share comedy': 'Share Comedy',
					'Share suspense': 'Share Suspense','Share scifi': 'Share Science fiction','Share vote': 'share Vote'};
	$scope.shareFB = function(type){
		var obj = {
			method: 'feed'
		};
		var root = $window.location.protocol 
				+ '//' +$window.location.host;
		var channel = { comedy: 'sc', suspense: 'st', scifi: 'ss', vote: 'sv'};
		var append = "?utm_source=facebook&utm_medium=banner&utm_content=0x0&utm_ch=" + channel[type] +  "&utm_campaign=Cookies";
		if (type != 'vote') {
			for (var key in $scope.users) {
				if ($scope.users[key].name === type)
					var uKey = key;
			}
			obj.picture = root + '/images/cookie_'+type+'.png';
			obj.name = $scope.users[uKey].facebook.shareTitle;
			obj.description = $scope.users[uKey].facebook.shareText;
			obj.link = root	+ append + '#main/?ref=' +$scope.users[uKey].facebook.shareReference;
		} else {
			obj.picture = root + '/images/cookie_comedy.png';
			obj.name  = $scope.settings.facebook.shareTitle;
			obj.description = $scope.settings.facebook.shareText;
			obj.link = root+  append +'#main/?ref'+ $scope.settings.facebook.shareReference;
		}
		FB.ui(obj, function(response) {
			$scope.track('Share ' + type);
			$scope.stats('share', type);
		});
	}
	$scope.stats = function(metric, type){
		$scope.Stats.save({type:metric}, {ref: type}, function(response){
			//console.log(response);
		});
	}
	$scope.track = function(action){
		//console.log('tracking: ' + action);
		var img = new Image;
		img.onload = function(){
			//console.log('pixel: ' + $scope.dict[action]);
			delete this;
		}
		img.src = "http://adserver.adtech.de/utrack/3.0/1391/0/0/0/BeaconId=15164;rettype=img;subnid=1;Section="+$scope.dict[action];
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
			var trailer = false
			, newObj = {}
			, totalVotes = 0;
			for (var i = 0;i<response.length;i++) {
				if(response[i].name === 'trailer') {
					trailer = true;
					var key = i;
				}
				newObj[response[i]._id] = response[i];
				totalVotes = totalVotes + response[i].votes;
			} 
			if (!trailer)
				var key = Math.floor((Math.random()*3000)/1000);

			$scope.currentVideo = response[key];
			$scope.videoId = response[key].videoId;
			$scope.videoName = response[key].name;
			$scope.track(response[key].name + ' Autoplay');
			$scope.thumbs = response;
			$scope.users = newObj;
			$scope.totalVotes = totalVotes;
		});
		$scope.stats('visit', $scope.ref);
	});
}];

var MainCtrl = ['$scope', function($scope){
	$scope.glob.mode='main';
	$scope.track('HP');
	function replaceArray(oldArray, old, nw){
		for (var i=0;i<oldArray.length;i++){
			itm = oldArray[i];
			if(itm['_id'] == old)
				var oldPos = i;
			if(itm['_id']  == nw)
				var newPos = i;
		}
		var oldItem = oldArray[oldPos];
		var newItem = oldArray[newPos];
		oldArray[oldPos] = newItem;
		oldArray[newPos] = oldItem;
		return oldArray;
	}
	$scope.setVideo = function(index){
		var oldId = $scope.currentVideo._id;
		$scope.currentVideo = $scope.thumbs[index];
		$scope.thumbs = replaceArray($scope.thumbs, oldId, $scope.thumbs[index]._id);
		$scope.videoName = $scope.currentVideo.name;
		$scope.videoId = $scope.currentVideo.videoId;
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

var LoginCtrl = ['$scope', '$window' , function($scope, $window){
	var prevUrl = $scope.location.$$search.url;
	$scope.glob.mode='pop';
	$scope.loginSubmit = function(){
		$scope.Login.save({}, {username: $scope.username, password: $scope.password}, function(resp){
			if (resp.error === undefined){
				(prevUrl === undefined) ? $scope.location.path('/admin') : $window.location.href = prevUrl;
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
	var fb_param = {};
	fb_param.pixel_id = '6006581314569';
	fb_param.value = '0.00';
	(function(){
		var fpw = document.createElement('script');
		fpw.async = true;
		fpw.src = (location.protocol=='http:'?'http':'https')+'://connect.facebook.net/en_US/fp.js';
		var ref = document.getElementsByTagName('script')[0];
		ref.parentNode.insertBefore(fpw, ref);
	})();
}];