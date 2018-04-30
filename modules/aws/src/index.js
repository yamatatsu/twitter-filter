const path = require('path');
const kuromoji = require('kuromoji');

const builder = kuromoji.builder({ dicPath: path.resolve('dict') });

exports.handler = (event, context) => {
  builder.build((err, tokenizer) => {
    if (err) {
      console.error(err);
      context.fail(err);
    } else {
      const token = tokenizer.tokenize('すもももももももものうち');
      console.log(token);
      context.succeed(token);
    }
  });
};
