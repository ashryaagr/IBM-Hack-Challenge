const express = require('express') ;
const passport = require('../passport') ;
const Friend = require('../models/friend') ;
const rp = require('request') ;
const path = require('path') ;
const fs = require('fs') ;
const PersonalityInsightsV3 = require('ibm-watson/personality-insights/v3');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');
const ToneAnalyzerV3 = require('ibm-watson/tone-analyzer/v3');

const router = new express.Router() ;

const personalityInsights = new PersonalityInsightsV3({
	version: '2017-10-13',
	iam_apikey: process.env.ibm_api_key ,
	url: ''.concat(process.env.ibm_url ,'/personality-insights/api'),
	disable_ssl_verification: true,
});

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
	version: '2018-11-16',
	iam_apikey: process.env.ibm_api_key ,
	url: ''.concat(process.env.ibm_url, '/natural-language-understanding/api'),
	disable_ssl_verification: true,
});

const toneAnalyzer = new ToneAnalyzerV3({
  version: '2017-09-21',
  iam_apikey: process.env.ibm_api_key ,
  url: ''.concat(process.env.ibm_url, '/tone-analyzer/api')
});

router.get('/', (req, res)=>{
	res.send({ message : "<h1>Welcome to the backend service of the web app)</h1>" }) ;
}) ;

const get_data = function (user_id, friend_id){
	return new Promise(function (resolve, reject) {
		try {
			if (!fs.existsSync(path.join(process.env.cache_dir, '/'.concat(friend_id, '.txt')))) {
				const friend = Friend.find({ _id: friend_id, owner: user_id}) ;
				const options = {
					uri: process.env.FLASK_URL,
					body: {
						'usernames': friend.usernames, // friend.usernames is a map from service name to the userid
						'id': friend.id
					},
					method: 'POST'
				};
				rp(options).then((response) => {
					resolve(response);
				}).catch(err => {
					reject(err);
				})
			} else {
				resolve(friend_id)
			}
		}catch (e) {
			reject(e)
		}
	})
} ;

router.post('/personality', passport.authenticate('jwt', { session:false }), (req, res)=>{
	const friend = Friend.find({ _id: req.body._id, owner: req.user._id}) ;
	get_data(req.user_id, req.body._id).then(response=>{
		if (!response) return res.status(500).send() ;
		const profileParams = {
			// Get the content from the JSON file.
			content: require(path.join(process.env.cache_dir, ''.concat(friend._id, '.json'))),
			content_type: 'text/plain',
			consumption_preferences: true,
			raw_scores: true,
		};
		personalityInsights.profile(profileParams)
			.then(profile => {
				fs.writeFile(path.join(process.env.cache_dir, '/'.concat(friend._id, '-personality.json')), profile, (err) => {
					if (err) return res.status(500).send(err)
				});
				res.send(profile);
			}).catch(err => {
				res.status(500).send(err)
			});
	}).catch((err)=>{
		return res.status(500).send(err) ;
	})
}) ;

router.post('/nlu', passport.authenticate('jwt', { session: false }), (req, res)=> {
	// Call to the NLU service of ibm + coding interests from localhost:8000/stack
	const friend = Friend.find({_id: req.body._id, owner: req.user._id});
	get_data(req.user_id, req.body._id).then((response) => {
		return response;
	}).then((response) => {
		if (!response) return res.status(500).send();
		const analyzeParams = {
			'url': 'www.ibm.com',
			'features': {
				'categories': {
					'limit': 10
				},
			'text': require(path.join(process.env.cache_dir, ''.concat(friend._id, '.json'))),
			content_type: 'text/plain',
			}
		};
		naturalLanguageUnderstanding.analyze(analyzeParams)
			.then(analysisResults => {
				fs.writeFile(path.join(process.env.cache_dir, '/'.concat(friend._id, '-nlu.json')), analysisResults, (err) => {
					if (err) return res.status(500).send(err)
				});
				res.send(analysisResults)
			})
			.catch(err => {
				res.status(500).send(err)
			});
	});
}) ;

router.post('/tone', passport.authenticate('jwt', { session:false }), (req,res)=>{
	// call to the tone analyzer
	const friend = Friend.find({_id: req.body._id, owner: req.user._id});
	get_data(req.user_id, req.body._id).then((response) => {
		if (!response) return res.status(500).send();
		const toneParams = {
			tone_input: {
			'text' : require(path.join(process.env.cache_dir, ''.concat(friend._id, '.json'))),
			},
			content_type: 'text/plain',
			sentences: false,
		};
		toneAnalyzer.tone(toneParams)
			.then(toneAnalysis => {
				fs.writeFile(path.join(process.env.cache_dir, '/'.concat(friend._id, '-tone.json')), toneAnalysis, (err) => {
					if (err) return res.status(500).send(err)
				});
				res.send(toneAnalysis)
			}).catch(err => {
				res.status(500).send(err)
			});
	});
}) ;


module.exports = router ;