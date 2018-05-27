const path = require("path");
const dict = require("./dict.json");
const model = require("./model.json");
const { SVM } = require("svm");
const kuromoji = require("kuromoji");

const builder = kuromoji.builder({
  dicPath: path.resolve("node_modules", "kuromoji", "dict"),
});

const svm = new SVM();
svm.fromJSON(model);

module.exports = tweet => {
  builder.build((err, tokenizer) => {
    if (err) {
      console.error(err);
    } else {
      const words = tokenizer
        .tokenize(tweet)
        .filter(t => ["名詞", "動詞", "形容詞"].includes(t.pos))
        .map(t => (t.basic_form === "*" ? t.surface_form : t.basic_form));
      console.info(words);
      const vector = dict.map(dw =>
        words.reduce((c, w) => (dw === w ? c + 1 : c), 0)
      );
      console.info(vector);
      console.info(svm.marginOne(vector));
    }
  });
};
