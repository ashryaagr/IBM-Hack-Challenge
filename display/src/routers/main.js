const express = require('express') ;
const router = new express.Router() ;
const Friend = require('../models/friend') ;
const User = require('../models/user') ;
const fs = require('fs') ;
const path = require('path') ;
const cluster = require('./clustering');
const passport = require('../passport') ;

router.get('/', (req, res)=>{
	res.render('register') ;
}) ;

router.get('/login', (req, res)=>{
	console.log(req)
	res.render('login') ;
}) ;

router.get('/register', (req, res)=>{
	res.render('register') ;
}) ;

router.get('/add_friend', (req, res)=>{
	res.render('add_friend') ;
}) ;

router.get('/friend/:id/', (req, res)=>{
	Friend.findById(req.params.id, function (err, friend) {
		if (err) res.status(400).send() ;
		User.findById(friend.owner, function(err, user){
			if (err) res.status(400).send() ;
			var personalityInsights = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../cache', ''.concat(friend._id, '-personality.json')), 'utf-8')) ;
			var friend_interests_json = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../cache', ''.concat(friend._id, '-nlu.json')), 'utf-8')).categories ;
			var user_interests_json = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../cache', ''.concat(user.reference, '-nlu.json')), 'utf-8')).categories ;
			var tones = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../cache', ''.concat(friend._id, '-tone.json')), 'utf-8')).document_tone.tones ;
			var personality = personalityInsights.personality ;
			var values = personalityInsights.values ;
			var needs = personalityInsights.needs ;
			var consumption_preferences = personalityInsights.consumption_preferences ;
			var friend_interests=[], user_interests=[] ;
			var A = []
			personality.forEach((item)=>{A.push([item.raw_score])}) ;
			friend_interests_json.forEach((item)=>{friend_interests.push(item.label.split('/').join(" "))}) ;

			user_interests_json.forEach((item)=>{ user_interests.push(item.label.split('/').join(" "))}) ;
			let common_interests = friend_interests.filter(x=> user_interests.includes(x)) ;
			res.render('friend', {
				A,
				values,
				needs,
				consumption_preferences,
				common_interests,
				tones,
				friend_name : friend.name || "No Name given",
				user_name : user.name || "You"
		}) ;
		}) ;
	}) ;
}) ;

router.get('/overview' , passport.authenticate('jwt', {}), (req , res) =>{
	cluster(req.user); //Is this neccessary? I'm not sure..

	let user = req.user;

	var user_interests_json = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../cache', ''.concat(user.reference, '-nlu.json')), 'utf-8')).categories ;
	user_interests=[] ;
	user_interests_json.forEach((item)=>{ user_interests.push(item.label.split('/').join(" "))}) ;

	var friends_data = [];

	Friend.find({owner : user._id , _id : { $ne : user.reference }} , function(err , friends){

		if (err)
			throw Error(err.message) ;
		else{
			friends.forEach((friend)=>{
				var friend_interests_json = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../cache', ''.concat(friend._id, '-nlu.json')), 'utf-8')).categories ;
				var friend_interests=[]; 

				friend_interests_json.forEach((item)=>{friend_interests.push(item.label.split('/').join(" "))}) ;

				let common_interests = friend_interests.filter(x=> user_interests.includes(x)) ;

				friends_data.push({
					name : friend.name || "No Name given", 
					category : friend.category,
					common_interests : common_interests
				});

				return friends_data;
			}).then((friends_data) => {
				let categories = {
					high : 0,
					medium : 0,
					low : 0,
				};

				for(let i = 0; i<friends_data.length ; i++)
					categories[friends_data[i].category]++;

				res.render('overview' , {
					friends_data , 
					categories
				});
			});
		}
	});

});

module.exports = router ;