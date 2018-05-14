const path = require("path");
const kuromoji = require("kuromoji");

const builder = kuromoji.builder({ dicPath: path.resolve("dict") });

function getTokenizer() {
  return new Promise((resolve, reject) => {
    builder.build((err, tokenizer) => {
      if (err) {
        reject(err);
      } else {
        resolve(text => tokenizer.tokenize(text));
      }
    });
  });
}
module.exports = getTokenizer;
