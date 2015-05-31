var myApp=angular.module('myApp', ['ngRoute']);

//.config is kind of like a local routes controller
myApp.config(function ($routeProvider){
	$routeProvider
		.when('/coordinate', {templateUrl:'partials/coordinate.html'})
		.when('/contribute', {templateUrl:'partials/contribute.html'})
		.when('/about', {templateUrl:'partials/about.html'})
		.when('/events', {templateUrl:'partials/events.html'})
		.when('/', {templateUrl:'partials/index.html'})
		.when('/mission', {templateUrl:'partials/mission.html'})
		.when('/login', {templateUrl:'partials/login.html'})

		.otherwise({redirectTo:'/'});
});
