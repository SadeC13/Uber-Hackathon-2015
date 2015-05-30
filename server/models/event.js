var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var eventSchema = new mongoose.Schema({
	title: String, 
	_creator: {type: Schema.Types.ObjectId, ref: 'User'},
	_token: {type: Schema.Types.ObjectId, ref: 'Token'},
	location: String,
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
	created_at: [{ type: Date, default: Date.now }]
});

mongoose.model('Event', eventSchema);