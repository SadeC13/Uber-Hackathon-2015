var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var userSchema = new mongoose.Schema({
	name: String, 
	phone: String, 
	email: String,
	no_people: Number,
	address: String, 
	events: [{type: Schema.Types.ObjectId, ref: 'Event'}],
	created_at: { type: Date, default: Date.now }
}); 

mongoose.model('User', userSchema);