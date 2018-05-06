import path from "path";
import kuromoji from "kuromoji";

const builder = kuromoji.builder({ dicPath: path.resolve("dict") });

export default function getTokenizer() {
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
