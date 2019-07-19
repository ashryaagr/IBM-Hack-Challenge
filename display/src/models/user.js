const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcryptjs') ;
const jwt = require('jsonwebtoken') ;
const Friend = require('./friend') ;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        default: "Anonymous"
    },
    password: {
        type: String,
        required: true,
    },
	usernames : {
		type : Map,
		of : String
    } ,
	reference : {
		type: mongoose.Schema.Types.ObjectId,
	},
    tokens: [{
        token: {
            type: String,
        }
    }],
}, {
	timestamps: true
});

userSchema.virtual('friends', {
	ref: 'friend',
	localField: '_id',
	foreignField: 'owner'
});

userSchema.pre('save', async function (next) {
	const user = this ;
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8)
	}
	next()
}) ;

userSchema.methods.toJSON = function () {
	const user = this ;
	const userObject = user.toObject() ;

	delete userObject.password ;
	delete userObject.tokens ;

	return userObject
} ;

userSchema.methods.generateAuthToken = async function () {
	const user = this ;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_KEY) ;

	user.tokens = user.tokens.concat({ token }) ;
	await user.save() ;

	return token
} ;

// Delete user friends when user is removed
userSchema.pre('remove', async function (next) {
	const user = this ;

	await Friend.deleteMany({ owner: user._id }) ;
	next()
}) ;

userSchema.plugin(passportLocalMongoose);

const user = mongoose.model('User', userSchema);

module.exports = user ;