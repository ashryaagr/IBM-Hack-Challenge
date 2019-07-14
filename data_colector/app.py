import tweepy
import stackapi
import praw
import json
import twitter_credentials
from flask import Flask

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
    #fill below credentials
    def __init__(self, username):
        pass
        # self.reddit = praw.Reddit(client_id=add client id,
        #              client_secret=add client secret,
        #              user_agent= add user agent)
        # self.username = username
        # self.content = ''

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

@app.route("/get_details/<twitter>/<reddit>/<int:stack>",methods=['GET'])
def get_details(twitter , stack , reddit):
    twitterid=twitter
    stackid = stack
    redditid = reddit

    profile = Stackoverflow_Top_Tags(stackid)
    coding_interests = profile.get_top_tags()
    
    tweets = Tweets(str(twitterid))
    tweet_plain_text , tweet_content_as_list , times , lang = tweets.get_tweet_details()

    reddit_profile = Reddit(str(redditid))
    reddit_content = reddit_profile.get_content()
     
    complete_data = tweet_plain_text + coding_interests + reddit_content

    return "<p>" + tweet_plain_text + "</p>" +  "<p>" + reddit_content + "</p>" + "<p>" + "".join(coding_interests) + "</p>"

if __name__ == '__main__':
    app.run(debug=True , port=8000)
    

