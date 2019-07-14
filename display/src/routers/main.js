const express = require('express') ;
const passport = require('../passport') ;
const Friend = require('../models/friend') ;
const rp = require('request') ;
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

// flask endpoint to call for stack : https://localhost:8000/stack (for development version)
// twitter(and all except stack): https://localhost:8000/ (for development version)

router.post('/personality', passport.authenticate('jwt', { session:false }), (req, res)=>{
	const friend = Friend.find({ _id: req.body._id, owner: req.user._id}) ;
	const options1= {
		uri: process.env.FLASK_URL,
		json: true,
		body : {
			'usernames': friend.usernames,
			'id': friend.id
		},
		method: 'POST'
	} ;
	rp(options1).then((response)=>{
		return response ;
	}).then((response)=>{
		if (!response) return res.status(500).send() ;
		const profileParams = {
			// Get the content from the JSON file.
			content: require(''.concat(friend._id, '.json')),
			content_type: 'application/json',
			consumption_preferences: true,
			raw_scores: true,
		};
		personalityInsights.profile(profileParams)
			.then(profile => {
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
	var interests;
	if (friend.usernames['stack']) {
		const options2 = {
			uri: ''.concat(process.env.FLASK_URL, '/stack'),
			json: true,
			body: {
				'stack': friend.username['stack'] // would be null if user does not supply stack username
			},
			method: 'POST'
		};
		rp(options2).then((response) => {
			interests = response
		}).catch((err) => {
			return res.status(500).send(err)
		});
	}
	const options1 = {
		uri: process.env.FLASK_URL,
		json: true,
		body: {
			'usernames': friend.usernames,
			'id': friend.id
		},
		method: 'POST',
	};
	rp(options1).then((response) => {
		return response;
	}).then((response) => {
		if (!response) return res.status(500).send();
		const analyzeParams = {
			'url': 'www.ibm.com',
			'features': {
				'categories': {
					'limit': 10
				},
			'text' : require(''.concat(friend._id, '.json'))
			}
		};
		naturalLanguageUnderstanding.analyze(analyzeParams)
			.then(analysisResults => {
				res.send({analysisResults, interests})
			})
			.catch(err => {
				res.status(500).send(err)
			});
	});
}) ;

router.post('/tone', passport.authenticate('jwt', { session:false }), (req,res)=>{
	// call to the tone analyzer
	const friend = Friend.find({_id: req.body._id, owner: req.user._id});
	const options1 = {
		uri: process.env.FLASK_URL,
		json: true,
		body: {
			'usernames': friend.usernames,
			'id': friend.id
		},
		method: 'POST',
	};
	rp(options1).then((response) => {
		return response;
	}).then((response) => {
		if (!response) return res.status(500).send();
		const toneParams = {
			tone_input: { 'text': require(''.concat(friend._id, '.json')) },
			content_type: 'application/json',
		};
		toneAnalyzer.tone(toneParams)
			.then(toneAnalysis => {
				res.send(toneAnalysis)
			}).catch(err => {
				res.status(500).send(err)
			});
	});
}) ;


module.exports = router ;