# Flask app for affinity calculation

- This app has a single route('/)
- accepts object id of the friend and the user
- Based on the ObjectID, the app reads the json files that were cached .
- Tensorflow is used to calculate the affinity.
- Based on the popular idiom : "Birds of the same feather flock together" .

- Another proposed feature is that we use dimensionality reduction using sklearn PCA and then use it for visualisation. 