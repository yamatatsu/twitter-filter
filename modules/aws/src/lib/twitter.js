const util = require("util");
const Twitter = require("twitter");

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

function fetchHomeTimeline(params) {
  return new Promise((resolve, reject) => {
    client.get("statuses/home_timeline", params, (error, tweets) => {
      if (error) {
        reject(util.format("twitter fetchHomeTimeline: %o", error));
      } else {
        resolve(tweets);
      }
    });
  });
}
module.exports = { fetchHomeTimeline };
