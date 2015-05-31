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
userSchema.path('name').required(true, 'User name cannot be blank.');
userSchema.path('email').required(true, 'User email cannot be blank.');
mongoose.model('User', userSchema);