import tweepy
import stackapi
import praw
import json
import twitter_credentials
from flask import Flask,request,abort

complete_data = ''


class Tweets():

    language_keys = {'ar': 'Arabic', 'bg': 'Bulgarian', 'ca': 'Catalan', 'cs': 'Czech', 'da': 'Danish', 'de': 'German', 'el': 'Greek', 'en': 'English', 'es': 'Spanish', 'et': 'Estonian',
         'fa': 'Persian', 'fi': 'Finnish', 'fr': 'French', 'hi': 'Hindi', 'hr': 'Croatian', 'hu': 'Hungarian', 'id': 'Indonesian', 'is': 'Icelandic', 'it': 'Italian', 'iw': 'Hebrew',
         'ja': 'Japanese', 'ko': 'Korean', 'lt': 'Lithuanian', 'lv': 'Latvian', 'ms': 'Malay', 'nl': 'Dutch', 'no': 'Norwegian', 'pl': 'Polish', 'pt': 'Portuguese', 'ro': 'Romanian',
         'ru': 'Russian', 'sk': 'Slovak', 'sl': 'Slovenian', 'sr': 'Serbian', 'sv': 'Swedish', 'th': 'Thai', 'tl': 'Filipino', 'tr': 'Turkish', 'uk': 'Ukrainian', 'ur': 'Urdu',
         'vi': 'Vietnamese', 'zh_CN': 'Chinese (simplified)', 'zh_TW': 'Chinese (traditional)','und':'Undetermined'}

    def __init__(self , username):
        self.username = username
        self.tweet_text = ''
        self.tweet_list = []
        self.tweet_time = []
        self.tweet_lang = []
        self.api = tweepy.API(self.authenticate_twitter_app())

    def authenticate_twitter_app(self):
        auth = tweepy.OAuthHandler(twitter_credentials.CONSUMER_KEY, twitter_credentials.CONSUMER_SECRET)
        auth.set_access_token(twitter_credentials.ACCESS_TOKEN, twitter_credentials.ACCESS_TOKEN_SECRET)
        return auth

    def get_tweet_details(self):
        tweets =  self.api.user_timeline(screen_name=self.username, count=500,tweet_mode='extended')
        for tweet in tweets:
            self.tweet_text += tweet.full_text + " "
            self.tweet_list.append(tweet.full_text)
            self.tweet_time.append(tweet.created_at)
            lang = str(tweet.lang)
            if lang == "et":
                lang="en"
            self.tweet_lang.append(self.language_keys[lang])
        return (self.tweet_text , self.tweet_list , self.tweet_time , self.tweet_lang)

class Stackoverflow_Top_Tags():
    def __init__(self, stackexchange_id):
        self.id = stackexchange_id
        self.top_tags = ''

    def get_top_tags(self):
        site = stackapi.StackAPI('stackoverflow')
        fields = site.fetch('users/{ids}/top-tags' , ids=[self.id])
        top_fields = fields['items'][:10]
        for field in list(top_fields):
            self.top_tags += field['tag_name'] + " "
        return self.top_tags


class Reddit():
    def __init__(self, username):
        self.reddit = praw.Reddit(
                     client_secret='
                     )
        self.username = username
        self.content = ''

    def get_submission_ids(self):
        user = self.reddit.redditor(self.username) 
        post_ids = user.submissions.new()
        return post_ids

    def get_content(self):
        post_ids = self.get_submission_ids()
        for post_id in post_ids:
            submission = self.reddit.submission(id=post_id)
            self.content += submission.title + " " + submission.selftext + " "
        return self.content



app = Flask(__name__)

@app.route("/",methods=['POST'])
def get_details():
    if(request.is_json):
        req_data = request.get_json()
    else:
        return 'REQUEST NOT JSON'

    twitterid = None
    stackid = None
    redditid = None
    coding_interests = ''
    tweet_plain_text = ''
    reddit_content = ''
    usernames = req_data['usernames']
    data_file = str(req_data["id"])+ '.txt'

    if 'twitter' in 'usernames':
        twitterid = usernames['twitter']
    if 'stackid' in 'usernames':
        stackid = usernames['stack']
    if 'redditid' in 'usernames':
        redditid = usernames['reddit']

    if(stackid != None):
        stackoverflow_profile = Stackoverflow_Top_Tags(int(stackid))
        coding_interests = profile.get_top_tags()
    
    if(twitterid != None):
        tweets = Tweets(str(twitterid))
        tweet_plain_text , tweet_content_as_list , times , lang = tweets.get_tweet_details()

    if(redditid != None):
        reddit_profile = Reddit(str(redditid))
        reddit_content = reddit_profile.get_content()
     
    complete_data = tweet_plain_text + coding_interests + reddit_content

    try:
        with open(data_file , 'w') as f:
            f.write(complete_data)
        return 'success'
    except:
        abort(404)

        

if __name__ == '__main__':
    app.run(debug=True , port=8000)
    

