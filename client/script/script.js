var myApp=angular.module('myApp', ['ngRoute']);

//.config is kind of like a local routes controller
myApp.config(function ($routeProvider){
	$routeProvider
		.when('/contribute', {templateUrl:'views/contribute.html'})
		.when('/', {templateUrl: 'views/landing.html'})
		.when('/about', {templateUrl:'views/about.html'})
		.when('/events', {templateUrl:'views/events.html'})
		.when('/mission', {templateUrl:'views/mission.html'})
		.when('/login', {templateUrl:'views/login.html'})

		.otherwise({redirectTo:'/'});
});
$(function() {
    $( "#from" ).datepicker({
      defaultDate: "+1w",
      changeMonth: true,
      numberOfMonths: 3,
      onClose: function( selectedDate ) {
        $( "#to" ).datepicker( "option", "minDate", selectedDate );
      }
    });
    $( "#to" ).datepicker({
      defaultDate: "+1w",
      changeMonth: true,
      numberOfMonths: 3,
      onClose: function( selectedDate ) {
        $( "#from" ).datepicker( "option", "maxDate", selectedDate );
      }
    });
$('#us3').locationpicker({
location: {latitude: 46.15242437752303, longitude: 2.7470703125},	
radius: 300,
inputBinding: {
	latitudeInput: $('#us3-lat'),
	longitudeInput: $('#us3-lon'),
	radiusInput: $('#us3-radius'),
	locationNameInput: $('#us3-address')        
},
enableAutocomplete: true,
onchanged: function(currentLocation, radius, isMarkerDropped) {
	console.log("Location changed. New location (" + currentLocation.latitude + ", " + currentLocation.longitude )
}  

  });
});

angular.module('myApp').controller('TimepickerDemoCtrl', function ($scope, $log) {
  $scope.mytime = new Date();

  $scope.hstep = 1;
  $scope.mstep = 15;

  $scope.options = {
    hstep: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    mstep: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]
  };

  $scope.ismeridian = true;
  $scope.toggleMode = function() {
    $scope.ismeridian = ! $scope.ismeridian;
  };

  $scope.update = function() {
    var d = new Date();
    d.setHours( 14 );
    d.setMinutes( 0 );
    $scope.mytime = d;
  };

  $scope.changed = function () {
    $log.log('Time changed to: ' + $scope.mytime);
  };

  $scope.clear = function() {
    $scope.mytime = null;
  };

});
 angular.module('timeExample', [])
   .controller('DateController', ['$scope', function($scope) {
     $scope.example = {
       value: new Date(1970, 0, 1, 14, 57, 0)
     };
   }]);

myApp.factory('eventFactory', function($http) {
	events = [];
	var factory = {}; 

	factory.getEvents = function(callback) {
			$http.get('/show').success(function(output) {
				events = output; 
				for (var i = 0; i < events.length; i++) {
					// ACTUALLY USE LAT/LONG?
					// $http.post('/show_price_estimate', {latitude: 37.378276, longitude: -121.917581, project: events[i]}).success(function(result){
					// 	events[i].estimate_price = result.estimate_price; 
					// 	events[i].isSponsored = result.isSponsored;
					// });
				}
				console.log(events);
				callback(events);
			});
		}
	return factory;
}); 

myApp.controller('eventController', function($scope, eventFactory) {
	$scope.events; 
	eventFactory.getEvents(function(data) {
		$scope.events = data;
	});
});

