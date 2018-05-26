const util = require("util");
const AWS = require("aws-sdk");

const documentClient = new AWS.DynamoDB.DocumentClient();

function batchPutToRawTweets(tweets) {
  const params = {
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
  };
  return documentClient
    .batchWrite(params)
    .promise()
    .catch(handleErr("dynamodb batchPutToRawTweets. %o", { tweets }));
}

function updateRawTweets(TweetId, attrName, value) {
  const params = {
    TableName: "TwitterFilter_RawTweets",
    Key: { TweetId },
    UpdateExpression: "set #a = :x",
    ExpressionAttributeNames: { "#a": attrName },
    ExpressionAttributeValues: { ":x": value },
  };
  return documentClient
    .update(params)
    .promise()
    .catch(
      handleErr("dynamodb updateRawTweets. %o", { TweetId, attrName, value })
    );
}

function fetchRawTweets(limit, options = {}) {
  const params = {
    TableName: "TwitterFilter_RawTweets",
    Limit: limit,
    ...options,
  };
  return documentClient.scan(params).promise();
}

function putToKVS(key, value) {
  const params = {
    TableName: "TwitterFilter_KVS",
    Item: { Key: key, Value: value },
  };
  return documentClient
    .put(params)
    .promise()
    .catch(handleErr("dynamodb putToKVS. %o", { key, value }));
}

function getValueFromKVS(key) {
  const params = {
    TableName: "TwitterFilter_KVS",
    Key: { Key: key },
  };
  return documentClient
    .get(params)
    .promise()
    .then(data => data.value)
    .catch(handleErr("dynamodb getValueFromKVS. %o", { key }));
}

module.exports = {
  batchPutToRawTweets,
  updateRawTweets,
  fetchRawTweets,
  putToKVS,
  getValueFromKVS,
};

// /////////
// private

function handleErr(message, obj) {
  return err =>
    Promise.reject(
      util.format(message, {
        err,
        ...obj,
      })
    );
}
