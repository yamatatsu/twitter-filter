const getTokenizer = require("../lib/tokenizer");
const db = require("../lib/dynamodb");

function textToToken(event, context) {
  getTokenizer()
    .then(tokenizer => {
      const promises = event.Records.filter(isInsertEvent).map(record => {
        const tweetId = record.dynamodb.Keys.TweetId.S;
        const text = record.dynamodb.NewImage.text.S;
        const tokens = tokenizer.tokenize(text);
        return db.updateRawTweets(tweetId, "tokens", tokens);
      });
      return Promise.all(promises);
    })
    .then(results => {
      context.succeed(results);
    })
    .catch(err => {
      context.fail(err);
    });
}
module.exports = textToToken;

const isInsertEvent = record => record.eventName === "INSERT";
