// @flow
// TODO: flow導入
/* eslint-disable react/prop-types */
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  ScrollView,
} from "react-native";

import initDynamodbCient from "./lib/dynamodb";

const FETCH_LIMIT = 1;
export default class Container extends React.Component {
  constructor(props) {
    super(props);

    const { IdentityPoolId } = props.config;

    this.dynamodbClient = initDynamodbCient(IdentityPoolId);
  }

  componentDidMount() {
    this.fetch();
  }

  fetch() {
    Promise.resolve()
      .then(() => this.dynamodbClient.getLastEvaluatedKey())
      .then(lastEvaluatedKey =>
        this.dynamodbClient.fetchRawTweets(FETCH_LIMIT, lastEvaluatedKey)
      )
      .then(data => {
        this.setState({
          tweet: data.Items[0],
          lastEvaluatedKey: data.LastEvaluatedKey,
        });
      });
  }

  deal(favorite) {
    const { tweet, lastEvaluatedKey } = this.state;
    Promise.resolve()
      .then(() => this.dynamodbClient.updateTeacherLabel(tweet, favorite))
      .then(() => this.dynamodbClient.putLastEvaluatedKey(lastEvaluatedKey))
      .then(() => {
        this.fetch();
      });
  }

  render() {
    const { tweet, lastEvaluatedKey } = this.state || {};
    if (!tweet) {
      return (
        <View style={styles.container}>
          <Text>fetching...</Text>
        </View>
      );
    }
    if (!lastEvaluatedKey) {
      // これをラベル付けしてしまうと、次のtweetが取れなくなるので保留する
      return (
        <View style={styles.container}>
          <Text>All tweets has labeled!!</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <ScrollView>
          <Text
            style={{
              top: 100,
              margin: 20,
              fontSize: 28,
              fontWeight: "700",
            }}
          >
            {tweet.text}
          </Text>
        </ScrollView>

        <View style={{ flexDirection: "row" }}>
          <MyButton label="true" onPress={() => this.deal(true)} />
          <MyButton label="false" onPress={() => this.deal(false)} />
        </View>
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

function MyButton(props) {
  const buttonStyles = StyleSheet.create({
    button: {
      backgroundColor: "steelblue",
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      width: 160,
      height: 100,
      margin: 10,
    },
    text: {
      fontSize: 32,
      fontWeight: "700",
      color: "white",
    },
  });
  return (
    <TouchableHighlight style={buttonStyles.button} onPress={props.onPress}>
      <Text style={buttonStyles.text}>{props.label}</Text>
    </TouchableHighlight>
  );
}
