const Friend = require('../models/friend') ;
const fs = require('fs') ;
const clustering = require('density-clustering') ;
const path = require('path') ;

const cluster = function (user) {
	var current_user = user.reference;
	var user_info = get_info(current_user);

	//required initializations
	var affinities = [];
	var friends_id =[];
	var base_tones = ['anger' , 'fear' , 'joy' , 'sadness' , 'analytical' , 'confidence' , 'tentative'];

	//preprocessing of the user's tone analyzer data
	var user_tone = get_base_tone();
	for(let i = 0 ; i<user_info['tone_analyzer']['document_tone']['tones'].length ; i++)
		user_tone[user_info['tone_analyzer']['document_tone']['tones'][i]['tone_id']] = user_info['tone_analyzer']['document_tone']['tones'][i]['score'];

	//Quering the friends of the current user except the reference for the current user himself
	Friend.find({owner : user._id, _id : { $ne : current_user }} , function(err , friends){
		if (err)
			throw Error(err.message) ;
		else{
			var counter=0 ; // Number of times loop has been traversed
			friends.forEach((friend)=>{
				//getting the friend's data
				var info = get_info(friend._id);
				var temp = 0;

				//personality insight data processing
				for(let i = 0 ; i < 5 ; i++)
					temp += Math.pow(1 - Math.abs(info['personality_insight']['personality'][i]['percentile'] - user_info['personality_insight']['personality'][i]['percentile']) , 2);

				//tone analyzer data processing
				var curr_tone = get_base_tone();

				for(let i = 0 ; i<info['tone_analyzer']['document_tone']['tones'].length ; i++)
					curr_tone[info['tone_analyzer']['document_tone']['tones'][i]['tone_id']] = info['tone_analyzer']['document_tone']['tones'][i]['score'];

				for(let i = 0 ; i < 7 ; i++)
					temp += Math.pow(1 - Math.abs(curr_tone[base_tones[i]] - user_tone[base_tones[i]]) , 2);

				//average of traits and tones
				temp = Math.sqrt(temp / (5 + 7));

				//nlu data processing
				var y = 0;
				var total = info['nlu']['categories'].length + user_info['nlu']['categories'].length;

				var current_values = {};

				for(let j = 0 ; j<user_info['nlu']['categories'].length ; j++)
					current_values[user_info['nlu']['categories'][j]['label']] = 1;

				for(let j = 0 ; j<info['nlu']['categories'].length ; j++)
					if(info['nlu']['categories'][j]['label'] in current_values)
						y++;

				total -= y;
				temp += (Math.exp( (2*y - (total - y)) / total ) - Math.exp(-1)) / (Math.exp(2) - Math.exp(-1));

				//adding calculated affinity
				friend.affinity = temp/2 ;
				friend.save().catch(err=>{
					throw Error(err.message) ;
				}) ;
				affinities.push([temp / 2]);
				friends_id.push(friend._id);

				counter++ ;
				if (counter===friends.length){

					//clustering
					var n = 3;
					if(friends.length < 3)
						n = friends.length;
					var kmeans = new clustering.KMEANS();

					if (n!=0)
					{
						var clusters = kmeans.run(affinities , n);

						clusters.sort((a , b)=>{
							return affinities[b[0]] - affinities[a[0]];
						});

						var categories = ['high' , 'medium' , 'low'];

						var friends_categories = {}

						for (let i = 0 ; i < n ; i++)
						{
							for(let j = 0 ;  j < clusters[i].length ; j++){
								friends_categories[friends_id[j]] = categories[i]
								Friend.findByIdAndUpdate({category : categories[i]})
							}
						}
					}
				}
			})
		}
	})
} ;

//extracts data from cached json files
function get_info(id)
{
	var nlu_data = JSON.parse(fs.readFileSync(path.join(__dirname, `../../../cache/${id}-nlu.json`)));
	var personality_data = JSON.parse(fs.readFileSync(path.join(__dirname,`../../../cache/${id}-personality.json`)));
	var tone_data = JSON.parse(fs.readFileSync(path.join(__dirname,`../../../cache/${id}-tone.json`)));

	return {
		'nlu' : nlu_data,
		'personality_insight' : personality_data,
		'tone_analyzer' : tone_data
	}
};

//returns a base tone object
function get_base_tone ()
{
	return {
		'anger' : 0.25,
		'fear' : 0.25,
		'joy' : 0.25,
		'sadness' : 0.25,
		'analytical' : 0.25,
		'confidence' : 0.25,
		'tentative' : 0.25
	}
}

module.exports = cluster ;