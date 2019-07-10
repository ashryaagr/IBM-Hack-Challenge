import tweepy
import stackapi
import json
import twitter_credentials

class Tweets():
    def __init__(self , username):
        self.username = username
        self.tweet_list = []
        self.tweet_time = []
        self.tweet_lang = []
        self.api = tweepy.API(self.authenticate_twitter_app())

    def authenticate_twitter_app(self):
        auth = tweepy.OAuthHandler(twitter_credentials.CONSUMER_KEY, twitter_credentials.CONSUMER_SECRET)
        auth.set_access_token(twitter_credentials.ACCESS_TOKEN, twitter_credentials.ACCESS_TOKEN_SECRET)
        return auth

    def get_tweet_details(self):
        tweets =  self.api.user_timeline(screen_name=self.username, count=25,tweet_mode='extended')
        for tweet in tweets:
            self.tweet_list.append(tweet.full_text)
            self.tweet_time.append(tweet.created_at)
            self.tweet_lang.append(tweet.lang)
        return (self.tweet_list , self.tweet_time , self.tweet_lang)

class Stackoverflow_Top_Tags():
    def __init__(self, stackexchange_id):
        self.id = stackexchange_id
        self.top_tags = []

    def get_top_tags(self):
        site = stackapi.StackAPI('stackoverflow')
        fields = site.fetch('users/{ids}/top-tags' , ids=[self.id])
        top_fields = fields['items'][:10]
        for field in list(top_fields):
            self.top_tags.append(field['tag_name'])
        return self.top_tags


if __name__ == '__main__':

    #example usage
    tweets = Tweets('realDonaldTrump')
    content , times , lang = tweets.get_tweet_details()

    profile = Stackoverflow_Top_Tags(22656)
    coding_interests = profile.get_top_tags()
