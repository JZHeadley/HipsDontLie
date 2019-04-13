import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BPMComponent from './bpm/BPMComponent.js';

export default class App extends React.Component {
  credentials = require('./secrets.js');
  
  constructor(props) {
    super(props);

    this.state = {
      accelerometerData: {},
      userPreferences: 'acoustic,afrobeat,alt-rock,alternative,ambient'
    }
    this.handleBPMChange.bind(this);
  }
handleBPMChange(bpm){
  console.log(bpm);
}
  render() {
    return (
      <View style={styles.container}>
        <Text>Accelerometer:</Text>
        <BPMComponent onBPMChange={this.handleBPMChange}></BPMComponent>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
