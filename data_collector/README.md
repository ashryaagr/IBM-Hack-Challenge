# Data collector

- This flask endpoint consists of a single endpoint '/'
- The port for this flask app will be 8000
- The endpoint listens for a post request . The body for the post request will be of type :
```
body: {
    'usernames': friend.usernames,
    'id': friend.id
}
```
- friend.usernames is a map from service name to the userid for that service
  for eg usernames["twitter""] will give username for twitter .
- id refers to the ObjectID of the friend being analysed .
- This endpoint will collect tweets and data from stack, reddit and store them to the file.
- Naming convention for the file will be {ObjectID}.json . Replace {ObjectID} with id obtained from body .