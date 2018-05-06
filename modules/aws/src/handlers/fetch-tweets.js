const chunk = require("lodash/chunk");
const last = require("lodash/last");
const db = require("../lib/dynamodb");
const twitter = require("../lib/twitter");

const LAST_FETCHED_TWEET_ID = "LAST_FETCHED_TWEET_ID";

function fetchTweets(event, context) {
  Promise.resolve()
    .then(() => db.getValueFromKVS(LAST_FETCHED_TWEET_ID))
    .then(lastFetchedTweetId =>
      twitter.fetchHomeTimeline({
        count: 200, // API仕様の最大値
        since_id: lastFetchedTweetId,
      })
    )
    .then(tweets => {
      console.info("fetched_tweets: %o", tweets);

      return Promise.all([
        db.putToKVS(LAST_FETCHED_TWEET_ID, last(tweets).id),
        ...chunk(tweets, 25).map(db.batchPutToRawTweets),
      ]);
    })
    .then(data => {
      context.succeed(data);
    })
    .catch(err => {
      context.fail(err);
    });
}
module.exports = fetchTweets;
