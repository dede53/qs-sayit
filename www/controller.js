var app = 	angular.module('sayIt',[
				'mediaPlayer'
				// ,'ngRoute'
			]);

app.factory('socket', function ($rootScope) {
	var socket = io.connect();
	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {  
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		},
		socket: socket
	};
});
// app.config(['$routeProvider', function($routeProvider) {
// 	$routeProvider.
// 	when('/home', {
// 		templateUrl: './home.html'
// 	}).
// 	otherwise({
// 		redirectTo: '/home'
// 	});
// }]);
app.controller('appController', function($scope, socket, $timeout){
	$scope.status = "stopped";
	$scope.playlist1 = [];
	var oasis = { src: './mp3/test.mp3', type: 'audio/mp3'};
	
	// console.log($scope.audio1.network);
	// console.log($scope.audio1.ended);
	
	$scope.play = function(){
		socket.emit('playlist:play');
		$scope.audio1.play();
	}

	$scope.pause = function(){
		socket.emit('playlist:pause');
	}
	$scope.add = function(){
		socket.emit('playlist:add', oasis);
	}

	socket.on('add', function(req){
		$scope.playlist1[0] = req;
		$scope.audio1.reset();
		$scope.audio1.play();
	});
	$timeout(function(){
		$scope.audio1.load(true);
	});

	socket.on('play', function(req){
		$scope.status = "playing";
		$scope.audio1.play();
	});

	socket.on('pause', function(req){
		$scope.status = "stopped";
		$scope.audio1.pause();
	});
});