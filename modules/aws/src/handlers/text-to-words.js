const getTokenizer = require("../lib/tokenizer");
const db = require("../lib/dynamodb");

const isInsertEvent = record => record.eventName === "INSERT";

const TARGET_POS = ["名詞", "動詞", "形容詞"];
const tokensToWords = tokens =>
  tokens
    .filter(t => TARGET_POS.includes(t.pos))
    .map(t => (t.basic_form === "*" ? t.surface_form : t.basic_form));

function textToWords(event, context) {
  getTokenizer()
    .then(tokenize => {
      const promises = event.Records.filter(isInsertEvent).map(record => {
        const tweetId = record.dynamodb.Keys.TweetId.S;
        const text = record.dynamodb.NewImage.text.S;
        const tokens = tokenize(text);
        const words = tokensToWords(tokens);
        return db.updateRawTweets(tweetId, "words", words);
      });
      return Promise.all(promises);
    })
    .then(results => {
      console.info(results);
      context.succeed(results);
    })
    .catch(err => {
      context.fail(err);
    });
}
module.exports = textToWords;
