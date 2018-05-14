const AWS = require("aws-sdk");

const lambda = new AWS.Lambda({ apiVersion: "2015-03-31" });

function invokeAsync(fnName) {
  const params = {
    FunctionName: fnName,
    InvocationType: "Event",
  };
  return lambda.invoke(params);
}

module.exports = {
  invokeAsync,
};
