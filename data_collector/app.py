import tweepy
import stackapi
import praw
import twitter_credentials
import reddit_credentials
import stackexchange_credentials
import youtube_credentials
import json
import requests
from apiclient.discovery import build 
from html2text import html2text
from flask import Flask,request,abort
from pathlib import Path

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
            lang = str(tweet.lang)
            if lang == "et":
                lang="en"
            if (lang=="en"):
                self.tweet_text += tweet.full_text + " "
                self.tweet_list.append(tweet.full_text)
                self.tweet_time.append(tweet.created_at)
                self.tweet_lang.append(self.language_keys[lang])
        return (self.tweet_text , self.tweet_list , self.tweet_time , self.tweet_lang)

class Stackoverflow_Top_Tags():
    def __init__(self, stackexchange_id):
        self.id = stackexchange_id
        self.top_tags = ''
        self.post_text =''

    def get_top_tags(self):
        site = stackapi.StackAPI('stackoverflow')
        fields = site.fetch('users/{ids}/top-tags' , ids=[self.id])
        top_fields = fields['items'][:10]
        for field in list(top_fields):
            self.top_tags += field['tag_name'] + " "
        return html2text(self.top_tags)

    def get_posts_with_top_votes(self):
        site = stackapi.StackAPI('stackoverflow' , client_id = stackexchange_credentials.CLIENT_ID , key = stackexchange_credentials.CLIENT_KEY)
        site.max_pages = 1
        site.page_size = 10
        fields = site.fetch('users/{ids}/posts' , ids=[int(self.id)] , site="stackoverflow",sort='votes' , filter='withbody' ,order="desc")['items']
        for field in fields:
            self.post_text += html2text(field['body']) + ' '
        return self.post_text


class Reddit():
    def __init__(self, username):
        self.reddit = praw.Reddit(client_id=reddit_credentials.CLIENT_ID,
                     client_secret=reddit_credentials.CLIENT_SECRET,
                     user_agent=reddit_credentials.USER_AGENT)
        self.username = username
        self.content = ''

    def get_content(self):
        for submission in self.reddit.redditor('ChrisTheOutdoorsman').submissions.new(limit = 30):
            self.content += submission.title + " " + submission.selftext + " "
        return self.content

class Youtube():
    def __init__(self , username):
        self.text = ''
        self.auth()
        self.username = username
        self.id = self.get_id(self.username)
        
    def auth(self):
        self.youtube = build(youtube_credentials.YOUTUBE_API_SERVICE_NAME, youtube_credentials.YOUTUBE_API_VERSION , developerKey = youtube_credentials.DEVELOPER_KEY) 

    def get_id(self , username):
        request = self.youtube.channels().list(part="snippet,contentDetails,statistics",forUsername=username)
        self.response = request.execute()
        return self.response['items'][0]['id']

    def get_channel_description(self):
        self.text += self.response['items'][0]['snippet']['description'] + ' '

    def get_playlists(self): 
        request = self.youtube.playlists().list(part="snippet,contentDetails" , channelId=self.id , maxResults=50)    
        response = request.execute()
        fields = response['items']
        for field in fields:
            self.text += field['snippet']['title'] + field['snippet']['description'] + ' '
    
    def get_content(self):
        self.get_channel_description()
        self.get_playlists()
        return self.text


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
    youtubeid = None
    stackoverflow_post_content =''
    tweet_plain_text = ''
    reddit_content = ''
    youtube_content =''
    usernames = req_data['usernames']

    if usernames.get('twitter'):
        twitterid = usernames['twitter']
    if usernames.get('stack'):
        stackid = usernames['stack']
    if usernames.get('reddit'):
        redditid = usernames['reddit']
    if usernames.get('youtube'):
        youtubeid = usernames['youtube']

    if(stackid != None):
        stackoverflow_profile = Stackoverflow_Top_Tags(int(stackid))
        stackoverflow_post_content = stackoverflow_profile.get_posts_with_top_votes()
    
    if(twitterid != None):
        tweets = Tweets(str(twitterid))
        tweet_plain_text , tweet_content_as_list , times , lang = tweets.get_tweet_details()

    if(redditid != None):
        reddit_profile = Reddit(str(redditid))
        reddit_content = reddit_profile.get_content()

    if(youtubeid != None):
        user = Youtube(str(youtubeid))
        youtube_content = user.get_content()
     
    complete_data = tweet_plain_text + stackoverflow_post_content + reddit_content + youtube_content

    return complete_data

if __name__ == '__main__':
    app.run(debug=True , host='0.0.0.0',port=8000)
