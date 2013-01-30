'user strict';
angular.module('admin.controllers', ['ngResource', 'ngCookies']);

var GlobalCtrl = ['$scope', '$resource', '$location', '$window', '$routeParams','$cookies', function($scope,$resource,$location,$window,$routeParams,$cookies){
	$scope.window = $window
	, $scope.showMenu =true
	, $scope.Settings = $resource('/resources/settings', {_csrf: $cookies['csrf.token']}, {update: {method: 'PUT'}})
	, $scope.location = $location
	, $scope.resource = $resource
	, $scope.route = $routeParams
	, $scope.Math = $window.Math
	, $scope.Users = $scope.resource('/resources/users/:user/:vote', {_csrf: $cookies['csrf.token']}, {update: {method:'PUT'}})
	, $scope.Voters = $scope.resource('/resources/voters/:voter', {_csrf: $cookies['csrf.token']})
	, $scope.Stats = $scope.resource('/resources/stats/:type', {_csrf: $cookies['csrf.token']})
	, $scope.Api = $scope.resource('/api/:action/:id', {_csrf: $cookies['csrf.token']});
	$scope.cookies = $cookies;
	$scope.Settings.get({}, function(settings){
		$scope.settings = settings
	});
}];

var MainCtrl = ['$scope', function($scope){
	$scope.Users.query({}, function(response){
		$scope.users = response;
	});
	$scope.Stats.query({type: 'visit'}, function(resp){
		$scope.refs = resp;
	});
	$scope.Stats.query({type: 'share'}, function(resp){
		$scope.shares = resp;
	});
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

var SettingsCtrl = ['$scope', function($scope){
	$scope.Settings.get({}, function(settings){
		$scope.settings = settings;
	});
	$scope.usersObj = [];
	$scope.Users.query({}, function(response){
		$scope.users = response;
	});
	$scope.fileElm = [];
	$scope.save = function(action){
		if (action==='title')
			$scope.Settings.update({},{title: $scope.settings.title}, function(resp){
				//console.log(resp);
			});
		else if (action==='toggle') {
			$scope.Settings.update({}, {modeState: !$scope.settings.modeState}, function(resp){
				//console.log(resp);
				$scope.settings.modeState = resp.modeState;
			});
		} else if (action==='facebook')
			$scope.Settings.update({}, {facebook: $scope.settings.facebook}, function(resp){
				$scope.settings.facebook = resp.facebook;
			});
	}
	$scope.updateUser = function(index){
		var sendObj = $scope.users[index];
		delete sendObj.votes, sendObj._id, sendObj.hidden;
		$scope.Users.update({user: sendObj._id}, sendObj, function(resp){
			//console.log(resp);
		});
	}
	$scope.videoCheck = function(id, cb){
		$scope.Api.get({action: 'videoCheck', id: id}, function (resp) {
			var invalid = (resp.type === undefined) ? true : false;
			cb( invalid );
		})
	}
	$scope.formInvalid = function(formObj, id){
		$scope.videoCheck(id, function(resp){
			formObj.$invalid = resp;
		});
	}
	$scope.setFiles = function (_element) {
		$scope.$apply(function ($scope) {
			for (var i=0;i<_element.files.length;i++){
				$scope.file = _element.files[i];
				$scope.prepareUpload(_element.files[i]);
			}
		});
	};
	$scope.prepareUpload = function(_file){
		var imageType = /image.*/
		if(!_file.type.match(imageType)){ 
			return alert('only images allowed');
		} else {
			var reader = new FileReader();
			reader.onload = (function (file){
				return function (env){
					$scope.upload();
				}
			}(_file))
			reader.readAsDataURL(_file);
		}
	}

	$scope.upload = function(){
		$scope.fd = new FormData();
		$scope.fd.append('leadersImage', $scope.file);
		$scope.fd.append('_csrf', $scope.cookies['csrf.token'])
		$scope.xhr = new XMLHttpRequest();
        $scope.xhr.open("POST", "/api/upload/leaders" , true);
       	$scope.xhr.send($scope.fd);
	}
}];