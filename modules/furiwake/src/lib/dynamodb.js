import AWS from "aws-sdk";

const LAST_EVALUATED_KEY = "App_LastEvaluatedKey_for_RawTweets";

export default function init(IdentityPoolId) {
  const documentClient = createDocumentClient(IdentityPoolId);

  return {
    fetchRawTweets: (limit, lastEvaluatedKey) => {
      const params = {
        TableName: "TwitterFilter_RawTweets",
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey || undefined,
      };
      return documentClient.scan(params).promise();
    },

    updateTeacherLabel: (tweet, favorite) => {
      const params = {
        TableName: "TwitterFilter_RawTweets",
        Item: { ...tweet, label: favorite ? 1 : -1 },
      };
      return documentClient.put(params).promise();
    },

    putLastEvaluatedKey: value => {
      const params = {
        TableName: "TwitterFilter_KVS",
        Item: { Key: LAST_EVALUATED_KEY, Value: value },
      };
      return documentClient.put(params).promise();
    },

    getLastEvaluatedKey: () => {
      const params = {
        TableName: "TwitterFilter_KVS",
        Key: { Key: LAST_EVALUATED_KEY },
      };
      return documentClient
        .get(params)
        .promise()
        .then(data => data && data.Item && data.Item.Value);
    },
  };
}

// /////////
// private

function createDocumentClient(IdentityPoolId) {
  AWS.config.region = "ap-northeast-1";
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId,
  });
  return new AWS.DynamoDB.DocumentClient();
}
