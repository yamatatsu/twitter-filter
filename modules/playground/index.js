function getTokenizer() {
  const kuromoji = require('kuromoji');
  const builder = kuromoji.builder({
    dicPath: path.resolve('node_modules', 'kuromoji', 'dict'),
  });
  return new Promise((resolve, reject) => {
    builder.build((err, tokenizer) => {
      if (err) {
        reject(err);
      } else {
        resolve(tokenizer);
      }
    });
  });
}

const kuromoji = require('kuromoji');

kuromoji
  .builder({ dicPath: path.resolve('node_modules', 'kuromoji', 'dict') })
  .build((err, tokenizer) =>
    console.log(tokenizer.tokenize('頑張っていこうぜ')),
  );

tokens
  .map(t => t.basic_form)
  .reduce((acc, w) => [[w, acc[0] ? acc[0][1] + 1 : 0], ...acc], []);
