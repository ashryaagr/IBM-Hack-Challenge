const express = require('express') ;
const passport = require('../passport') ;
const Friend = require('../models/friend') ;
const User = require('../models/user');
const fs = require('fs')
const clustering = require('density-clustering');

const router = new express.Router() ;

var big_five = ['']

router.get('/cluster', passport.authenticate('jwt', { session:false }), (req, res)=>{
	var current_user = req.user._id;
	var user_info = get_info(current_user);
	var affinities = [];
	var friends_id =[]

	Friend.find({owner : current_user} , function(err , friends){
		if (err)
			res.status(400).send(err);
		else{
			friends.forEach((friend)=>{
				var info = get_info(friend._id);
				var temp = 0;
				for(let i = 0 ; i < 5 ; i++)
					temp += Math.pow(1 - Math.abs(info['personality_insight']['personality'][i]['percentile'] - user_info['personality_insight']['personality'][i]['percentile']) , 2);
				
				temp = temp / 5 ;

				var y = 0;
				var total = info['nlu']['categories'].length + user_info['nlu']['categories'].length;

				var current_values = {};

				for(let j = 0 ; j<user_info['nlu']['categories'].length ; j++)
					currrent_values[user_info['nlu']['categories'][j]['label']] = 1;

				for(let j = 0 ; j<info['nlu']['categories'].length ; j++)
					if(info['nlu']['categories'][j]['label'] in current_values)
						y++;
				
				total -= y;
				temp += (Math.exp( (2*y - (total - y)) / total ) - Math.exp(-1)) / (Math.exp(2) - Math.exp(-1));
				
				affinities.push(Math.sqrt(temp / 2));
				friends_id.push(friend._id)
			});
		}
	})
	var kmeans = new clustering.KMEANS();
	var clusters = kmeans.run(affinities , 5);

}) ;

function get_info(id)
{
	var nlu_data = JSON.parse(fs.readFileSync(`../../../cache/${id}-nlu.json`));
	var personality_data = JSON.parse(fs.readFileSync(`../../../cache/${id}-personality.json`));
	var tone_data = JSON.parse(fs.readFileSync(`../../../cache/${id}-tone.json`));

	return {
		'nlu' : nlu_data,
		'personality_insightaffinities.push(Math.sqrt(temp / 5))' : personality_data,
		'tone_analyzer' : tone_data
	}
};

module.exports = router ;