const { SVM } = require("svm");

const db = require("../lib/dynamodb");
const s3 = require("../lib/s3");

const wordsToVector = (words, dict) =>
  dict.map(dw => words.reduce((c, w) => (dw === w ? c + 1 : c), 0));

const concatVecAndLabel = (acc, vec, label) => {
  const [accVector, accLabels] = acc;
  return [[...accVector, vec], [...accLabels, label]];
};
const recurse = (dict, lastEvaluatedKey, vectors = [], labels = []) =>
  db
    .fetchRawTweets(200, {
      ExclusiveStartKey: lastEvaluatedKey || undefined,
      IndexName: "ByLabel",
    })
    .then(data => {
      const [newVectors, newLabels] = data.Items.reduce(
        (acc, { words, label }) =>
          words && label
            ? concatVecAndLabel(acc, wordsToVector(words, dict), label)
            : acc,
        [vectors, labels]
      );
      if (data.LastEvaluatedKey) {
        return recurse(dict, data.LastEvaluatedKey, newVectors, newLabels);
      }
      return [newVectors, newLabels];
    });

function createModel(event, context) {
  Promise.all([
    db.fetchRawTweets(100, {
      IndexName: "ByLabel",
    }),
    s3.getDict(),
  ])
    .then(([data, dict]) => {
      const [vectors, labels] = data.Items.reduce(
        (acc, { words, label }) =>
          words && label
            ? concatVecAndLabel(acc, wordsToVector(words, dict), label)
            : acc,
        [[], []]
      );
      const svm = new SVM();
      svm.train(vectors, labels);
      return s3.putModel(svm.toJSON());
    })
    .then(results => {
      console.info(results);
      context.succeed(results);
    })
    .catch(err => {
      context.fail(err);
    });
}
module.exports = createModel;
