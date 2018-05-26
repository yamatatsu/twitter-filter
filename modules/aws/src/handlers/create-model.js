const { SVM } = require("svm");

const db = require("../lib/dynamodb");
const s3 = require("../lib/s3");

// const dataToWordsList = data => data.Items.map(item => item.words);
// const dataToLabels = data => data.Items.map(item => item.label);
// const getWordsListAndLabels = data =>
//   data.Items.reduce(
//     (acc, { words, label }) => {
//       if (!words || !label) return acc;
//       const [accVector, accLabels] = acc;
//       return [
//         [...accVector, wordsToVector(words, dict)],
//         accLabels.concat(label),
//       ];
//     },
//     [[], []]
//   );
const wordsToVector = (words, dict) =>
  dict.map(w => (words.indexOf(w) === -1 ? 0 : 1));
// const createVectors = (wordsList, dict) =>
//   wordsList.map(words => wordsToVector(words, dict));

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
      // const wordsList = dataToWordsList(data);
      // const newLabels = labels.concat(dataToLabels(data));

      // const newVectors = vectors.concat(createVectors(wordsList, dict));

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
  s3
    .getDict()
    .then(dict => recurse(dict))
    .then(([vectors, labels]) => {
      const svm = new SVM();
      svm.train(vectors, labels);
      return s3.putModel(svm.toJson());
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
