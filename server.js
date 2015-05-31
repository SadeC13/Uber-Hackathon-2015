// UBER API STARTER KIT FOR NODE/EXPRESS
// We use passport to handle oauth for uber, passport uses express-session, and we use the passport-uber strategy. Https for sending api requests from our server and bodyparser for post data.
var express = require('express');
var session = require('express-session');
var passport = require('passport');
var uberStrategy = require('passport-uber');
var https = require('https');
var bodyParser = require('body-parser');
var geocoder = require('node-geocoder')('google', 'http');
var app = express();
var config = require('./config/config.js');
require('./config/mongoose.js'); 
var mongoose = require('mongoose');
var Token = mongoose.model('Token');
var User = mongoose.model('User')
var Event = mongoose.model('Event');
// Get all auth stuff from config file
// ClientID & ClientSecret for API requests with OAUTH
var clientID = config.ClientID;
var clientSecret = config.ClientSecret;

// ServerID for API requests without OAUTH
var ServerID = config.ServerID;

// sessionSecret used by passport
var sessionSecret = "UBERAPIROCKS" 

app.use(session({
	secret: sessionSecret,
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/client'));
app.set('views', __dirname + '/client/views');
// remove? not using ejs or views 
app.set('view engine','ejs');
// bodyparser for handling post data
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// post to show unauthorized request
app.post('/cars', function(request, response) {
  getRequest('/v1/products?latitude='+request.body.start_latitude+'&longitude='+request.body.start_longitude, function(err, res) {
    response.json(res);
  })
})
//NIKKI'S USING THIS TO VIEW HER PAGE
app.get('/coordinate', function(request, response){
  response.render('coordinate')
})

// use this for an api get request without oauth
function getRequest(endpoint, callback) {
  var options = {
    hostname: "sandbox-api.uber.com",
    path: endpoint,
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      Authorization: "Token " + ServerID
    }
  }
  var req = https.request(options, function(res) {
    var fullRes = '';
    res.setEncoding('utf8');
    res.on('readable', function() {
      var chunk = this.read() || '';
      fullRes += chunk;
      console.log('chunk: ' + Buffer.byteLength(chunk) + ' bytes');
    });
    res.on('end', function() {
      callback(null, JSON.parse(fullRes));
    });

  });
  req.end();

  req.on('error', function(err) {
    callback(err, null);
  });
}

// _______________ BEGIN PASSPORT STUFF ________________
// Serialize and deserialize users used by passport
passport.serializeUser(function (user, done){
  console.log('SerializeUser', user); 
	done(null, user);
});
passport.deserializeUser(function (user, done){
	done(null, user);
});

// define what strategy passport will use -- this comes from passport-uber
passport.use(new uberStrategy({
		clientID: clientID,
		clientSecret: clientSecret,
		callbackURL: "http://localhost:8000/auth/uber/callback"
	},
	function (accessToken, refreshToken, user, done) {
		console.log('user:', user.first_name, user.last_name);
		console.log('access token:', accessToken);
		console.log('refresh token:', refreshToken);

    // SAVE TOKEN TO DB
    var token = new Token ({
      token: accessToken, 
      total_spent: 0, 
      no_rides: 0
    }); 
    token.save(function(err, token) {
      if (err) {
        console.log('Failed to add token to db', err);
      } else {
        console.log('Successfully added token to db.');

        // SAVE USER TO DB - ASSOCIATE TOKEN 
        var person = new User({
          name: user.first_name + ' ' + user.last_name,
          email: user.email,
          no_people: 1, 
          token: token._id
        }); 
        person.save(function(err, user) {
          if (err) {
            console.log('Failed to add user to db', err);
          } else {
            console.log('Successfully added user to db.');
          }
        }); 
      }
    });
    console.log('USER', user);
		user.accessToken = accessToken;
		return done(null, user);
	}
));

// backend test page
app.get('/backend', function(request, response) {
  response.render('backend_test');
});

// home page
app.get('/', function (request, response) {
  response.render('index');
});


// login page 
app.get('/login', function (request, response) {
	response.render('login');
});

// AUTH (get) request to start the whole oauth process with passport
app.get('/auth/uber',
	passport.authenticate('uber',
		{ scope: ['profile', 'history', 'history_lite', 'request', 'request_receipt'] }
	)
);

// AUTH_CALLBACK (get) redirects - failed to /login, success to /coordinate
app.get('/auth/uber/callback',
	passport.authenticate('uber', {
		failureRedirect: '/backend'
	}), function(req, res) {
    res.redirect('/coordinate');
});

// COORDINATE (get) - sends json with user email which MUST be included in event form 
app.get('/coordinate', ensureAuthenticated, function(request, response) {
  response.render('backend');
  // response.json({email: request.user.email}); 
});

// create an event
app.post('/create_event', ensureAuthenticated, function(request, response) {
  console.log('*********************CREATE_EVENT*************************'); 
  request.body = {
    title: 'Guerilla Gardening',
    location: '1980 Zanker Rd San Jose, CA 95112',
    start_time: new Date('Sat May 30 2015 17:26:58 GMT-0700 (PDT)'),
    end_time: new Date('Sat Jun 1 2015 17:26:58 GMT-0700 (PDT)'),
    community_impact_rating: 4,
    spend_limit: 200,    
    max_sponsored_rides: 7,
    max_per_ride: 25,
    image_url: 'http://upload.wikimedia.org/wikipedia/commons/2/2b/Flower_garden,_Botanic_Gardens,_Churchtown_2.JPG',
    category: 'environment',
    add_user_to_volunteers: 1,
    user_address_lat: 37.3768183,
    user_address_long: -121.912378    
  }

  var latitude;
  var longitude;
  geocoder.geocode(request.body.location, function(err, res) {
    // console.log('coordinates: ', res);
    latitude = res[0].latitude;
    longitude = res[0].longitude;

    var project = new Event({
      title: request.body.title,
      location: {
        address: request.body.location,
        latitude: latitude,
        longitude: longitude
      },
      start_time: request.body.start_time,
      end_time: request.body.end_time,
      community_impact_rating: request.body.community_impact_rating,
      spend_limit: request.body.spend_limit,
      total_spent: 0,
      max_sponsored_rides: request.body.max_sponsored_rides,
      max_per_ride: request.body.max_per_ride,
      ride_count_to_date: 0,
      image_url: request.body.image_url,
      category: request.body.category
    });
    // Add user as volunteer to event 
    if (request.body.add_user_to_volunteers) {
      var user = User.findOne({email: request.user.email}, function(err, user) {
        project.volunteers.push(user._id);

         // Save new event in DB
        project.save(function(err, result) {
          if (err) {
            console.log("Failed to save event!");
          } else {
            console.log("Successfully saved event!");
            console.log("Saved event:", result);

            // Update users events
            user.events.push(result);
          }
        }); 
      });
    } else {
       project.save(function(err, result) {
          if (err) {
            console.log("Failed to save event!");
          } else {
            console.log("Successfully saved event!");
            console.log("Saved event:", result);
          }
        });
    }
  });

  // Update user's address
  User.update({email: request.user.email}, {latitude: request.body.user_address_lat, longitude: request.body.user_address_long}, function(err, user) {
      if (err) { console.log(err); }
      else {
        console.log('Successfully updated user', user);
      }
  });
  
}); 

app.post('/show_events', function(req, res){
  req.body.latitude = 37.378276;
  req.body.longitude = -121.917581;

  var latitude = req.body.latitude;
  var longitude = req.body.longitude;

  Event.find({}, function(err, events){
     if (err) {
      console.log("error:", err);
    } else {
      console.log("Successfully found all events");
      var results = []; var isRunning = true; 
      for (var i = 0; i < events.length; i++) {
        var project = events[i];
        if (latitude && project.location.longitude && longitude && project.location.longitude &&
          project.max_sponsored_rides > project.ride_count_to_date) {
          console.log(project); 
          getRequest('/v1/estimates/price?start_latitude='+latitude+'&start_longitude='+longitude+'&end_latitude='+project.location.latitude+'&end_longitude='+project.location.longitude, function(err, response) {
            if (err) { console.log('ERR!', err); }
            else {
              console.log('UBER res: ', response);
              for (var j = 0; j < response.prices.length; j++) {
                if (response.prices[j].high_estimate < project.max_per_ride) {
                  console.log('TEST!');
                  results.push(project); 
                  console.log('RESULTS', results);
                  break;
                }
              }
            }
          }); 
        }
      }
      console.log('RESULTS - END', results);
      // res.json({results: results});
    }
  }); 

})

// /profile API endpoint, includes check for authentication
app.get('/profile', ensureAuthenticated, function (request, response) {
  console.log(request.user.accessToken);
	getAuthorizedRequest('/v1/me', request.user.accessToken, function (error, res) {
		if (error) { console.log('ERR', error); }
    // ADD USER PROFILE TO DB
    console.log(res);
		res.redirect('/coordinate');
	});
});

// // /history API endpoint
// app.get('/history', ensureAuthenticated, function (request, response) {
// 	getAuthorizedRequest('/v1.2/history', request.user.accessToken, function (error, res) {
// 		if (error) { console.log("err", error); }
//     console.log(res);
// 		response.json(res);
// 	});
// });

// ride request API endpoint
app.post('/request', ensureAuthenticated, function (request, response) {
	// NOTE! Keep in mind that, although this link is a GET request, the actual ride request must be a POST, as shown below
	var parameters = {
		start_latitude : request.body.start_latitude,
		start_longitude: request.body.start_longitude,
		end_latitude: request.body.end_latitude,
		end_longitude: request.body.end_longitude,
		product_id: "a1111c8c-c720-46c3-8534-2fcdd730040d"
	};

	postAuthorizedRequest('/v1/requests', request.user.accessToken, parameters, function (error, res) {
		if (error) { console.log(error); }
		response.json(res);
	});
});

// logout
app.get('/logout', function (request, response) {
	request.logout();
	response.redirect('/login');
});

// route middleware to make sure the request is from an authenticated user
function ensureAuthenticated (request, response, next) {
  console.log('inside ensure Authenticated');
	if (request.isAuthenticated()) {
		return next();
	}
	response.redirect('/login');
}

// use this for an api get request
function getAuthorizedRequest(endpoint, accessToken, callback) {
  var options = {
    hostname: "sandbox-api.uber.com",
    path: endpoint,
    method: "GET",
    headers: {
      Authorization: "Bearer " + accessToken
    }
  }
  var req = https.request(options, function(res) {
    res.on('data', function(data) {
      console.log('data!');
      console.log(JSON.parse(data));
      callback(null, JSON.parse(data));
    })
  })
  req.end();
  req.on('error', function(err) {
    callback(err, null);
  });
}

// use this for an api post request
function postAuthorizedRequest(endpoint, accessToken, parameters, callback) {
  var options = {
    hostname: "sandbox-api.uber.com",
    path: endpoint,
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken,
      'Content-Type': 'application/json'
    }
  }
  var req = https.request(options, function(res) {
    res.on('data', function(data) {
      console.log('data!');
      console.log(JSON.parse(data));
      callback(null, JSON.parse(data));
    })
  })
  req.write(JSON.stringify(parameters));
  req.end();
  req.on('error', function(err) {
    callback(err, null);
  });
}

// start server
var server = app.listen(8000, function(){
	console.log('listening to port: 8000');
});
