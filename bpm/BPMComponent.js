import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Accelerometer } from 'expo';


class BPMComponent extends Component {
    //how many bmp readings we average together
    bpmResistance = 3
    bpmArr = []
    //tolernce of accelerometer data to prevent false hits
    tolerance = 1.07

    constructor(props) {
        super(props);

        this.state = {
            spotifyInitialized: false,
            accelerometerData: {},
            bpm: 0,
            hits: 0,
            userPreferences: 'acoustic,afrobeat,alt-rock,alternative,ambient'
        }
    }

    componentDidMount() {

        this.accelerometerSubscribe();
        this._interval = setInterval(() => {
            if (this.bpmArr.length == this.bpmResistance) {
                this.bpmArr.shift()
                this.bpmArr.push(this.state.hits * 12)
            }
            else {
                this.bpmArr.push(this.state.hits * 12)
            }
            let ammt = Math.min(this.bpmArr.length, this.bpmResistance)
            let avg = 0
            for (i = 0; i < ammt; i++) {
                avg += this.bpmArr[i]
            }
            avg = avg / ammt
            this.setState({ bpm: avg })
            this.props.onBPMChange(this.state.bpm);
            this.setState({ hits: 0 })
        }, 5000);
    }

    componentWillUnmount() {
        clearInterval(this._interval);
        this.accelerometerUnsubscribe();
    }

    accelerometerSubscribe = () => {
        this._subscription = Accelerometer.addListener(
            accelerometerData => {
                this.setState({ accelerometerData });
                this.calculateHit();
            }
        );
    };

    accelerometerUnsubscribe = () => {
        this._subscription && this._subscription.remove();
        this._subscription = null;
    };

    calculateHit() {
        let {
            x,
            y,
            z,
        } = this.state.accelerometerData;

        if (Math.sqrt((x * x) + (y * y) + (z * z)) > this.tolerance) {
            this.setState({ hits: this.state.hits + 1 });
        }
    }
    render() {

        return (
            <View>
                <Text style={customStyles.whiteText}>Hits: {this.state.hits}</Text>
                <Text style={customStyles.whiteText}>BPM: {this.state.bpm}</Text>
            </View>
        )
    }
}
const customStyles = StyleSheet.create({
    container: {
        backgroundColor: '#222222',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    background: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        resizeMode: "contain"
    },
    bottom: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 64
    },
    whiteText: {
        color: 'ghostwhite'
    }
});

export default BPMComponent;