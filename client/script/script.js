var myApp=angular.module('myApp', ['ngRoute']);

//.config is kind of like a local routes controller
myApp.config(function ($routeProvider){
	$routeProvider
		.when('/coordinate', {templateUrl:'views/coordinate.html'})
		.when('/contribute', {templateUrl:'views/contribute.html'})

		.otherwise({redirectTo:'/'});
});
