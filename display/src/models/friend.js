const mongoose = require('mongoose');
const request = require('request') ;
const path = require('path') ;
const fs = require('fs') ;
const PersonalityInsightsV3 = require('ibm-watson/personality-insights/v3');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');
const ToneAnalyzerV3 = require('ibm-watson/tone-analyzer/v3');


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
    },
	affinity : {
    	type : Number
	},
	category : {
    	type : String
	},
	common_interests : [{
			type : String
	}]
});

friendSchema.pre('save', async function (next) {
	const friend = this ;
	if (!fs.existsSync(path.join(__dirname, '../../../cache', ''.concat(friend._id, '.txt')))) {
		const post = {
			json: {
				'usernames': JSON.parse(JSON.stringify(friend.usernames)),
				'id': friend.id
			},
		};

		function doRequest() {
			return new Promise(function (resolve, reject) {
				request.post(process.env.FLASK_URL, post, function (error, res, body) {
					if (!error && (body.split(' ').length > 100)) {
						resolve(body);
					} else if (error) {
						reject(error);
					} else {
						reject("Not sufficient data to analyze")
					}
				});
			});
		}

		await doRequest();
		var data = fs.readFileSync(path.join(__dirname, '../../../cache', ''.concat(friend._id, '.txt')), 'utf-8');
		const profileParams = {
			content: data.toString(),
			content_type: 'text/plain',
			consumption_preferences: true,
			raw_scores: true,
		};
		personalityInsights.profile(profileParams)
			.then(profile => {
				fs.writeFile(path.join(__dirname, '../../../cache', ''.concat(friend._id, '-personality.json')), JSON.stringify(profile), (err) => {
					if (err) throw Error(err.message)
				});
			}).catch(err => {
			throw Error(err.message)
		});
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
					if (err) throw Error(err.message)
				});
			})
			.catch(err => {
				throw Error(err.message)
			});
		const toneParams = {
			tone_input: {
				'text': data.toString(),
			},
			content_type: 'text/plain',
			sentences: false,
		};
		toneAnalyzer.tone(toneParams)
			.then(toneAnalysis => {
				fs.writeFile(path.join(__dirname, '../../../cache', ''.concat(friend._id, '-tone.json')), JSON.stringify(toneAnalysis), (err) => {
					if (err) throw Error(err.message)
				});
			}).catch(err => {
			throw Error(err.message)
		});
	}
	next();
});

const Friend = mongoose.model('Friend', friendSchema);

module.exports = Friend ;