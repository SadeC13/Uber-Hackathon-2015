var myApp=angular.module('myApp', ['ngRoute']);

//.config is kind of like a local routes controller
myApp.config(function ($routeProvider){
	$routeProvider
		.when('/coordinate', {templateUrl:'partials/coordinate.html'})
		.when('/contribute', {templateUrl:'partials/contribute.html'})

		.otherwise({redirectTo:'/'});
});
