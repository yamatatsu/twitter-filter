const getTokenizer = require("../lib/tokenizer");
const db = require("../lib/dynamodb");

const TARGET_POS = ["名詞", "動詞", "形容詞"];
const tokensToWords = tokens =>
  tokens
    .filter(t => TARGET_POS.includes(t.pos))
    .map(t => (t.basic_form === "*" ? t.surface_form : t.basic_form));

const recurse = (tokenize, lastEvaluatedKey) =>
  db
    .fetchRawTweets(200, { ExclusiveStartKey: lastEvaluatedKey || undefined })
    .then(data =>
      // console.info("fetch success: %o", data);
      data.Items.reduce((acc, record) => {
        const { TweetId, text } = record;
        const tokens = tokenize(text);
        const words = tokensToWords(tokens);
        return acc.then(() => db.updateRawTweets(TweetId, "words", words));
      }, Promise.resolve()).then(() => {
        if (data.LastEvaluatedKey) {
          return recurse(tokenize, data.LastEvaluatedKey);
        }
        return Promise.resolve();
      })
    );

function textToWords(event, context) {
  getTokenizer()
    .then(tokenize => recurse(tokenize, { TweetId: "994781958898102272" }))
    .then(results => {
      console.info(results);
      context.succeed(results);
    })
    .catch(err => {
      context.fail(err);
    });
}
module.exports = textToWords;
