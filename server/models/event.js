var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var eventSchema = new mongoose.Schema({
	title: String, 
	_creator: {type: Schema.Types.ObjectId, ref: 'User'},
	_token: {type: Schema.Types.ObjectId, ref: 'Token'},
	location: {
		address: String,
		latitude: Number,
		longitude: Number
	},
	start_time: Date,
	end_time: Date,
	community_impact_rating: Number,
	spend_limit: Number,
	total_spent: Number,
	max_sponsored_rides: Number,
	max_per_ride: Number,
	ride_count_to_date: Number,
	image_url: String,
	category: String,
	volunteers: [{type: Schema.Types.ObjectId, ref: 'User'}],
	created_at: { type: Date, default: Date.now }
});

eventSchema.path('title').required(true, 'Event title cannot be blank');
eventSchema.path('start_time').required(true, 'Event start_time cannot be blank');
eventSchema.path('end_time').required(true, 'Event end_time cannot be blank');
eventSchema.path('location.address').required(true, 'Event location.address cannot be blank');
eventSchema.path('location.latitude').required(true, 'Event location.latitude cannot be blank');
eventSchema.path('location.longitude').required(true, 'Event location.longitude cannot be blank');

mongoose.model('Event', eventSchema);

