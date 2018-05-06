const util = require("util");
const AWS = require("aws-sdk");

const documentClient = new AWS.DynamoDB.DocumentClient();

function batchPutToRawTweets(tweets) {
  return new Promise((resolve, reject) => {
    documentClient.batchWrite(
      {
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
      },
      (err, data) => {
        if (err) {
          const message = util.format("dynamodb batchPutToRawTweets. %o", {
            err,
            tweets,
          });
          reject(message);
        } else {
          resolve(data);
        }
      }
    );
  });
}

function putToKVS(key, value) {
  return new Promise((resolve, reject) => {
    documentClient.put(
      { TableName: "TwitterFilter_KVS", Item: { Key: key, Value: value } },
      (err, data) => {
        if (err) {
          const message = util.format("dynamodb putToKVS. %o", {
            err,
            key,
            value,
          });
          reject(message);
        } else {
          resolve(data);
        }
      }
    );
  });
}

function getValueFromKVS(key) {
  return new Promise((resolve, reject) => {
    documentClient.get(
      { TableName: "TwitterFilter_KVS", Key: { Key: key } },
      (err, data) => {
        if (err) {
          const message = util.format("dynamodb getValueFromKVS. %o", {
            err,
            key,
          });
          reject(message);
        } else {
          resolve(data.value);
        }
      }
    );
  });
}

module.exports = { batchPutToRawTweets, putToKVS, getValueFromKVS };
