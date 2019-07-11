const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : true
    },
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'user',
	},
    usernames : {
        type : Map,
        of : String
    } 
});

const friend = mongoose.model('Friend', friendSchema);

module.exports = friend ;