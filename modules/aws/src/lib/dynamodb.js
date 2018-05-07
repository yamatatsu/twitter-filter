const util = require("util");
const AWS = require("aws-sdk");

const client = createPromisedClient();

function batchPutToRawTweets(tweets) {
  return client("batchWrite", {
    RequestItems: {
      TwitterFilter_RawTweets: tweets.map(t => ({
        PutRequest: {
          Item: {
            TweetId: t.id_str,
            createdAt: t.created_at,
            text: t.text,
            userId: t.user.id,
            userName: t.user.name,
            userScreenName: t.user.screen_name,
          },
        },
      })),
    },
  }).catch(handleErr("dynamodb batchPutToRawTweets. %o", { tweets }));
}

function putToKVS(key, value) {
  return client("put", {
    TableName: "TwitterFilter_KVS",
    Item: { Key: key, Value: value },
  }).catch(handleErr("dynamodb putToKVS. %o", { key, value }));
}

function getValueFromKVS(key) {
  return client("get", {
    TableName: "TwitterFilter_KVS",
    Key: { Key: key },
  })
    .then(data => data.value)
    .catch(handleErr("dynamodb getValueFromKVS. %o", { key }));
}

module.exports = { batchPutToRawTweets, putToKVS, getValueFromKVS };

// /////////
// private

function createPromisedClient() {
  const documentClient = new AWS.DynamoDB.DocumentClient();

  return (func, params) =>
    new Promise((resolve, reject) => {
      documentClient[func](
        params,
        (err, data) => (err ? reject(err) : resolve(data))
      );
    });
}

function handleErr(message, obj) {
  return err =>
    Promise.reject(
      util.format(message, {
        err,
        ...obj,
      })
    );
}
