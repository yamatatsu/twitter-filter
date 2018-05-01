const path = require('path');
const kuromoji = require('kuromoji');

const builder = kuromoji.builder({ dicPath: path.resolve('dict') });

exports.handler = (event, context) => {
  builder.build((err, tokenizer) => {
    if (err) {
      console.error(err);
      context.fail(err);
    } else {
      const token = tokenizer.tokenize('すもももももももものうち');
      console.log(token);
      context.succeed(token);
    }
  });
};

// ////////////////////////////////////

const Twitter = require('twitter');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const params = {};
exports.fetchTwitterTimeline = (event, context) => {
  client.get('statuses/user_timeline', params, (error, tweets) => {
    if (error) {
      console.error(error);
      context.fail(error);
    } else {
      console.info(tweets);
      context.succeed(tweets);
    }
  });
};
