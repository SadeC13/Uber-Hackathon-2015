var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var tokenSchema = new mongoose.Schema({
	_event: {type: Schema.Types.ObjectId, ref: 'Event'},
	token: String,
	total_spent: Number,
	no_rides: Number,
	created_at: { type: Date, default: Date.now }
});

mongoose.model('Token', tokenSchema);