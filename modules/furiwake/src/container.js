import React from "react";
import { StyleSheet, Text, View, Alert } from "react-native";
import AWS from "aws-sdk";

AWS.config.region = "ap-northeast-1";
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: "hogeee",
});
const documentClient = new AWS.DynamoDB.DocumentClient();

export default class Container extends React.Component {
  componentDidMount() {
    documentClient.scan({ TableName: "TwitterFilter_KVS" }, (err, data) => {
      if (err) {
        Alert.alert(JSON.stringify(err));
        return;
      }
      this.setState({ data });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <Text>Changes you make will automatically reload.</Text>
        <Text>Shake your phone to open the developer menu.</Text>
        <Text>{JSON.stringify(this.state && this.state.data)}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
