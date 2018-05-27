const db = require("../lib/dynamodb");
const s3 = require("../lib/s3");
const lambda = require("../lib/lambda");

const uniqConcat = (arr1, arr2) =>
  arr2.reduce(
    (acc, el) => (acc.indexOf(el) === -1 ? acc.concat(el) : acc),
    arr1
  );

const recurse = (lastEvaluatedKey, dict = []) =>
  db
    .fetchRawTweets(200, { ExclusiveStartKey: lastEvaluatedKey || undefined })
    .then(data => {
      const newDict = data.Items.reduce(
        (acc, item) => (item.words ? uniqConcat(acc, item.words) : acc),
        dict
      );
      if (data.LastEvaluatedKey) {
        return recurse(data.LastEvaluatedKey, newDict);
      }
      return newDict;
    });

function wordsToDict(event, context) {
  recurse()
    .then(dict => s3.putDict(dict))
    .then(results => {
      console.info(results);
      lambda.invokeAsync("LambdaCreateModel");
      context.succeed(results);
    })
    .catch(err => {
      context.fail(err);
    });
}
module.exports = wordsToDict;
