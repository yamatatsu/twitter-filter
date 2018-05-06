import getTokenizer from "../lib/tokenizer";

export default function transportRawToVector(event, context) {
  getTokenizer
    .then(tokenizer => {
      const token = tokenizer.tokenize("すもももももももものうち");
      console.log(token);
      context.succeed(token);
    })
    .catch(err => {
      console.error(err);
      context.fail(err);
    });
}
