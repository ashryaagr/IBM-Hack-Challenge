const express = require('express') ;
const passport = require('../passport') ;
const User = require('../models/user') ;
const Friend = require('../models/friend');
const router = new express.Router() ;
const bcrypt = require('bcryptjs') ;

router.post('/login', async (req, res)=>{

	User.findOne({ username: req.body.username }, async function(err, user) {
		if (err) {
			return res.status(500).send();
		}
		if (!user) {
			return res.status(400).send("No such username");
		}
		const match = await bcrypt.compare(req.body.password, user.password);
		if (!match) {
			return res.status(400).send("Incorrect username") ;
		}
		const token = await user.generateAuthToken() ;
		res.cookie('jwt', token) ;
		res.redirect('/add_friend') ;
	}) ;
});

router.get('/logout', passport.authenticate('jwt', {}), async (req, res)=>{
	try {
		req.user.tokens = req.user.tokens.filter((token) => !req.headers.authorization.includes(token.token)) ;
		await req.user.save() ;
		res.send()
	} catch (e) {
		res.status(500).send() ;
	}
}) ;

router.post('/user', async (req, res)=>{
	const user = new User(req.body) ;
	user.usernames = {
		stack : req.body.stack,
		twitter : req.body.twitter,
		reddit : req.body.reddit,
		youtube : req.body.youtube
	};
	const friend_self = Friend({
		name: user.name,
		owner: user._id,
		usernames: user.usernames
	}) ;
	user.reference = friend_self._id ;
	friend_self.save()
		.then(friend=>{
			user.save()
		.then((user)=>{
		res.redirect('/login')
		}).catch((err)=>{
		res.status(400).send(err)
	}) ;
		}).catch((err)=>{
		res.status(400).send(err)
	}) ;
}) ;

router.patch('/user', passport.authenticate('jwt', { session:false }),
	async (req , res)=>{
		const updates = Object.keys(req.body) ;
		const allowedUpdates = ['username', 'email', 'password', 'name'] ;
		const isValidOperation = updates.every((update) => allowedUpdates.includes(update)) ;

		if (!isValidOperation) {
			return res.status(400).send({ error: 'Invalid updates!' })
		}

		try {
			updates.forEach((update) => req.user[update] = req.body[update]) ;
			await req.user.save() ;
			res.send(req.user)
		} catch (e) {
			res.status(400).send(e)
		}
	}) ;

router.delete('/user', passport.authenticate('jwt', { session:false }),
	async (req , res)=>{
		try {
			await req.user.remove()
		} catch (e) {
			res.status(500).send(e)
		}
	}) ;

module.exports = router ;