const passport = require('passport') ;
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user') ;
const bcrypt = require('bcryptjs') ;

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

passport.use('login', new LocalStrategy(
	function(username, password, done) {
		User.findOne({ username: username }, async function(err, user) {
			if (err) { return done(err); }
			if (!user) {
				return done(null, false, { message: 'Incorrect username.' });
			}
			const match = await bcrypt.compare(password, user.password) ;
			if (!match) {
				return done(null, false, { message: 'Incorrect password.' });
			}
			return done(null, user);
		});
	}
));

var JwtStrategy = require('passport-jwt').Strategy,
	ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {} ;

var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies)
    {
        token = req.cookies['jwt'];
    }
    return token;
};

opts.jwtFromRequest = ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken]);
opts.secretOrKey = process.env.SECRET_KEY ;

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
	User.findOne({id: jwt_payload.sub}, function(err, user) {
		if (err) {
			return done(err, false);
		}
		if (user) {
			return done(null, user);
		} else {
			return done(null, false);
			// or you could create a new account
		}
	});
}));

module.exports = passport ;