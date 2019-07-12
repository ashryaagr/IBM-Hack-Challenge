from flask import Flask
import tensorflow as tf

app = Flask(__name__)

x = tf.placeholder(tf.float64, shape=[5], name="raw_scores_friend")
y = tf.placeholder(tf.float64, shape=[5], name="raw_scores_user")
z = tf.subtract(x, y)
a = tf.subtract(1, z)
b = tf.square(a)
result = tf.reduce_mean(b)

sess = tf.InteractiveSession()

# TODO: We can use sklearn PCA dimensionality reduction and use result for data visualisation


@app.route('/', methods=['POST', ])
def affinity():
    sess.run(tf.global_variables_initializer)
    ans = result.eval(feed_dict={})  # TODO: add data to feed_dict by reading data from the files corresponding to the object ids recieved
    return ans


if __name__ == '__main__':
    app.run(debug=True)
