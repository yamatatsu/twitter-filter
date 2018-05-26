const getTokenizer = require("../lib/tokenizer");
const chunk = require("lodash/chunk");
const last = require("lodash/last");
const db = require("../lib/dynamodb");
const twitter = require("../lib/twitter");

const LAST_FETCHED_TWEET_ID = "LAST_FETCHED_TWEET_ID";

const TARGET_POS = ["名詞", "動詞", "形容詞"];
const tokensToWords = tokens =>
  tokens
    .filter(t => TARGET_POS.includes(t.pos))
    .map(t => (t.basic_form === "*" ? t.surface_form : t.basic_form));

function fetchTweets(event, context) {
  const fetchTweetsPromise = db
    .getValueFromKVS(LAST_FETCHED_TWEET_ID)
    .then(lastFetchedTweetId =>
      twitter.fetchHomeTimeline({
        count: 200, // API仕様の最大値
        since_id: lastFetchedTweetId,
      })
    );
  const tokenizerPromise = getTokenizer();
  Promise.all([fetchTweetsPromise, tokenizerPromise])
    .then(([tweets, tokenize]) => {
      console.info("fetched_tweets: %o", tweets);
      const tweetsWithWords = tweets.map(t => ({
        ...t,
        words: tokensToWords(tokenize(t.text)),
      }));

      return Promise.all([
        db.putToKVS(LAST_FETCHED_TWEET_ID, last(tweetsWithWords).id_str),
        ...chunk(tweetsWithWords, 25).map(db.batchPutToRawTweets),
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
