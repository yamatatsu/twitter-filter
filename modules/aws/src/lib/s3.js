const util = require("util");
const AWS = require("aws-sdk");

const s3 = new AWS.S3();

const Bucket = process.env.BUCKET_NAME;
const DICT_KEY = "dict.json";
const MODEL_KEY = "model.json";

function put(Key, Body) {
  return s3
    .putObject({ Body, Bucket, Key })
    .promise()
    .catch(handleErr("s3 putModel. %o", { Body }));
}

function get(Key) {
  return s3
    .getObject({ Bucket, Key })
    .promise()
    .catch(handleErr("s3 getModel"));
}
const putJson = (key, jsonObj) => put(key, JSON.stringify(jsonObj));
const getJson = key => get(key).then(data => JSON.parse(data.Body.toString()));

module.exports = {
  putDict: jsonObj => putJson(DICT_KEY, jsonObj),
  getDict: () => getJson(DICT_KEY),
  putModel: jsonObj => putJson(MODEL_KEY, jsonObj),
  getModel: () => getJson(MODEL_KEY),
};

// /////////
// private

function handleErr(message, obj = {}) {
  return err =>
    Promise.reject(
      util.format(message, {
        err,
        ...obj,
      })
    );
}
