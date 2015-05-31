var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var userSchema = new mongoose.Schema({
	name: String, 
	phone: String, 
	email: String,
	no_people: Number,
	latitude: Number,
	longitude: Number,
	events: [{type: Schema.Types.ObjectId, ref: 'Event'}],
	created_at: { type: Date, default: Date.now },
	token: {type: Schema.Types.ObjectId, ref: 'Token'}
}); 

mongoose.model('User', userSchema);