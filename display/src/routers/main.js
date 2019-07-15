const express = require('express') ;
const passport = require('../passport') ;
const Friend = require('../models/friend') ;
const request = require('request') ;
const path = require('path') ;
const fs = require('fs') ;
const PersonalityInsightsV3 = require('ibm-watson/personality-insights/v3');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');
const ToneAnalyzerV3 = require('ibm-watson/tone-analyzer/v3');

const router = new express.Router() ;

const personalityInsights = new PersonalityInsightsV3({
	version: '2017-10-13',
	iam_apikey: "DfyG5ufoFbVzHU4Vi8OT10Ar_lPiDrQwxuroxWBmlLy4" ,
	url: "https://gateway-lon.watsonplatform.net/personality-insights/api",
	disable_ssl_verification: true,
});

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
	version: '2018-11-16',
	iam_apikey: "df7OpYiPVRn4o3cF-HV9UP8eb8ZvWD5upYygGVRKY9az" ,
	url: "https://gateway-lon.watsonplatform.net/natural-language-understanding/api",
	disable_ssl_verification: true,
});

const toneAnalyzer = new ToneAnalyzerV3({
	version: '2017-09-21',
	iam_apikey: "Jen3RBgkWNXM07ZsQytRPFnxTLBlbTe5IHOlSzfPBHe0" ,
	url: "https://gateway-lon.watsonplatform.net/tone-analyzer/api",
	disable_ssl_verification: true,
});

router.get('/', (req, res)=>{
	res.render('index', {
		title : "Test Page",
		message : "Welcome to the backend service of the web app"
	}) ;
}) ;

const get_data = function (user_id, friend_id){
	return new Promise(function (resolve, reject) {
		try {
			if (!fs.existsSync(path.join(__dirname, '../../../cache', ''.concat(friend_id, '.txt')))) {
				Friend.findOne({ _id: friend_id, owner: user_id}, function (err, friend) {
					if (err) reject(err);
					const post = {
						json: {
							'usernames': JSON.parse(JSON.stringify(friend.usernames)),
							'id': friend.id
						},
					};
					request.post(process.env.FLASK_URL, post , function (err, data) {
						if (err) return reject(err) ;
						else return resolve(data) ;
					})
				}) ;
			} else {
				resolve(friend_id)
			}
		}catch (e) {
			reject(e)
		}
	})
} ;

router.post('/personality', passport.authenticate('jwt', { session:false }), (req, res)=>{
	Friend.findOne({ _id: req.body._id, owner: req.user._id}, function (err, friend) {
				if(err) return res.status(500).send() ;
		get_data(req.user._id, req.body._id).then(response=>{
			if (!response) return res.status(500).send() ;
			var data = fs.readFileSync(path.join(__dirname, '../../../cache', ''.concat(friend._id, '.txt')), 'utf-8') ;
			const profileParams = {
				content: data.toString() ,
				content_type: 'text/plain',
				consumption_preferences: false,
				raw_scores: true,
			};
			personalityInsights.profile(profileParams)
				.then(profile => {
					fs.writeFile(path.join(__dirname, '../../../cache', ''.concat(friend._id, '-personality.json')), JSON.stringify(profile), (err) => {
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
}) ;

router.post('/nlu', passport.authenticate('jwt', { session: false }), (req, res)=> {
	// Call to the NLU service of ibm + coding interests from localhost:8000/stack
	Friend.findOne({_id: req.body._id, owner: req.user._id}, function (err, friend) {
		if(err) return res.status(500).send() ;
		get_data(req.user._id, req.body._id).then(response => {
			if (!response) return res.status(500).send();
			var data = fs.readFileSync(path.join(__dirname, '../../../cache', ''.concat(friend._id, '.txt')), 'utf-8') ;
			const analyzeParams = {
				'text': data.toString(),
				'features': {
					'categories': {
						'limit': 10
					},
				}
			};
			naturalLanguageUnderstanding.analyze(analyzeParams)
				.then(analysisResults => {
					fs.writeFile(path.join(__dirname, '../../../cache', ''.concat(friend._id, '-nlu.json')), JSON.stringify(analysisResults), (err) => {
						if (err) return res.status(500).send(err)
					});
					res.send(analysisResults)
				})
				.catch(err => {
					res.status(500).send(err)
				});
			}).catch((err)=>{
				return res.status(500).send(err) ;
		});
	});
}) ;

router.post('/tone', passport.authenticate('jwt', { session:false }), (req,res)=>{
	// call to the tone analyzer
	Friend.findOne({_id: req.body._id, owner: req.user._id}, function (err, friend) {
		if(err) return res.status(500).send() ;
		get_data(req.user._id, req.body._id).then((response) => {
			if (!response) return res.status(500).send();
			var data = fs.readFileSync(path.join(__dirname, '../../../cache', ''.concat(friend._id, '.txt')), 'utf-8') ;
			const toneParams = {
				tone_input: {
				'text' : data.toString(),
				},
				content_type: 'text/plain',
				sentences: false,
			};
			toneAnalyzer.tone(toneParams)
				.then(toneAnalysis => {
					fs.writeFile(path.join(__dirname, '../../../cache', ''.concat(friend._id, '-tone.json')), JSON.stringify(toneAnalysis), (err) => {
						if (err) return res.status(500).send(err)
					});
					res.send(toneAnalysis)
				}).catch(err => {
					res.status(500).send(err)
				});
			}).catch((err)=>{
				return res.status(500).send(err) ;
		});
	});
}) ;


module.exports = router ;