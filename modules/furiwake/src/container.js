// @flow
import React from "react";
import { StyleSheet, Text, View, Alert } from "react-native";
import AWS from "aws-sdk";

export default class Container extends React.Component {
  constructor(props) {
    super(props);

    // TODO: flow導入
    // eslint-disable-next-line react/prop-types
    const { IdentityPoolId } = props.config;

    AWS.config.region = "ap-northeast-1";
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId,
    });
    this.documentClient = new AWS.DynamoDB.DocumentClient();
  }

  componentDidMount() {
    this.documentClient.scan(
      { TableName: "TwitterFilter_KVS" },
      (err, data) => {
        if (err) {
          Alert.alert(JSON.stringify(err));
          return;
        }
        this.setState({ data });
      }
    );
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
