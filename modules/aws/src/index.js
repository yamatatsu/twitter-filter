const path = require('path');
const kuromoji = require('kuromoji');

const builder = kuromoji.builder({
  dicPath: path.resolve(require.resolve('kuromoji'), '..', '..', 'dict'),
});

exports.handler = (event, context) => {
  builder.build((err, tokenizer) => {
    const token = tokenizer.tokenize('頑張っていこうぜ');
    console.log(token);
    context.succeed(JSON.stringify(token));
  });
};
