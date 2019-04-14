import React from 'react';
import { AuthSession } from 'expo'
import { encode as btoa } from 'base-64'
import { StyleSheet, Text, View, Button } from 'react-native';
import BPMComponent from '../bpm/BPMComponent.js';
class HomeScreen extends React.Component {
    bpmRange = 5
    songChangeTolorance = 30;

    credentials = require('../secrets.js');
    url = 'https://api.spotify.com/v1/recommendations'
    auth_url = 'https://accounts.spotify.com/authorize'

    // The url of the our app that spotify will redirect to after authenticating
    auth = AuthSession.getRedirectUrl()

    // Temperary dummy object for storing session data
    userData = {
        accessToken: '',
        refreshToken: '',
        expirationTime: ''
    }

    constructor(props) {
        super(props);

        this.state = {
            accelerometerData: {},
            userPreferences: 'acoustic,afrobeat,alt-rock,alternative,ambient',
            minBPM: 0,
            maxBPM: 1,
            oldBPM: 0,
            songURI: ""
        }
        this.handleBPMChange.bind(this);
        this.initializeSpotify();
    }
    scopes = 'user-modify-playback-state app-remote-control streaming user-read-playback-state user-library-modify user-library-read user-read-recently-played user-top-read user-read-currently-playing'
    async initializeSpotify() {
        const tokenExpirationTime = this.userData.expirationTime
        if (!tokenExpirationTime || new Date().getTime() > tokenExpirationTime) {
            await this.getTokens()
        } else {
            // Set the state so react we know we have the access token
            this.setState({ accessTokenAvailable: true })
        }
    }

    /*
     * Users must login through spotify for us to access their data
     * and use it to make recommendations. This function just lets us redirect
     * them to spotify in our app
     */
    getAuthorizationCode = async () => {
        try {
            // Redirect to spotify for login and get user access token
            result = await AuthSession.startAsync({
                authUrl:
                    this.auth_url +
                    '?response_type=code' +
                    '&client_id=' + this.credentials.secrets.clientID +
                    (this.scopes ? '&scope=' + encodeURIComponent(this.scopes) : '') +
                    '&redirect_uri=' +
                    encodeURIComponent(this.auth)
            });
        } catch (err) {
            console.error(err)
        }
        return await result.params.code
    }

    /*
     * So to get an access token for a profile, spotify requires
     * developers to give the clientID and clientSecret for their app
     * to the auth endpoint which will make sure everything is leget
     * then spit out an access token for that user. The access token is what
     * lets us play with user data (like make recommendations based on their past listens)
     */
    getTokens = async () => {
        try {
            // Redirect to spotify
            const authorizationCode = await this.getAuthorizationCode()

            // Things need to be base64 encoded
            const credsB64 = btoa(`${this.credentials.secrets.clientID}:${this.credentials.secrets.clientSecret}`)
            // POST request for the tokens
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${credsB64}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `grant_type=authorization_code&code=${authorizationCode}&redirect_uri=${
                    this.auth
                    }`,
            })

            const responseJson = await response.json()

            const {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_in: expiresIn,
            } = responseJson

            const expirationTime = new Date().getTime() + expiresIn * 1000

            // Save the user data somehow
            // It probably shouldn't be just an object like this
            // but to make sure it works then this is fine
            this.userData.accessToken = accessToken
            this.userData.refreshToken = refreshToken
            this.userData.expirationTime = expirationTime

        } catch (err) {
            console.error(err)
        }
    }

    handleBPMChange = (bpm) => {
        //con = this
        bpm = Math.min(bpm, 200)
        bpm = Math.max(bpm, 40)
        if (Math.abs(bpm - this.state.oldBPM) > this.songChangeTolorance) {
            this.setState({ oldBPM: bpm })
            this.setState({ minBPM: Math.max(bpm - this.bpmRange, 0) })
            this.setState({ maxBPM: (bpm + this.bpmRange) })
            this.getSpotifyRecomendations()
            this.getAlbumArt(this.state.songURI)
                .then((res) => res.json())
                // .then(json => console.log(json))
                .then(json => json["album"]["images"])
                .then(images => images[0])
                .then(image => {
                    console.log(image)
                    this.setState({ imageUrl: image })
                })
                .catch(errror => {
                    console.warn(errror)
                })
            this.playSong(this.state.songURI)
                .then(res => console.log(res))
        }
    }

    setUserPreferences(genres) {
        this.setState({ userPreferences: genres })
    }

    randomChoice(arr) {
        if (arr)
            return arr[Math.floor(Math.random() * arr.length)]
    }

    getAlbumArt(uri) {
        console.log("Fetching album Art")
        let url = "https://api.spotify.com/v1/tracks/" + uri.split(":")[2] + "/"
        console.log(url)
        return fetch(url,
            {
                method: "GET",
                headers: {
                    'Authorization': 'Bearer ' + this.userData.accessToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            })
    }



    async getSpotifyRecomendations() {
        let con = this
        console.log("Getting recommendations")
        return await fetch(this.url +
            '?seed_genres=' + this.state.userPreferences +
            '&min_tempo=' + this.state.minBPM +
            '&max_tempo=' + this.state.maxBPM +
            '&target_danceability=0.8' +
            '&market=US',
            {
                method: "GET",
                headers: {
                    'Authorization': 'Bearer ' + this.userData.accessToken
                }
            }).then(async (res) => {
                let songList = await res.json()
                // Stop being undefined you async bastard
                let songUri = con.randomChoice(songList.tracks) ? con.randomChoice(songList.tracks).uri : []
                con.setState({ songURI: songUri })
            })
    }

    playSong(uri) {
        console.log(uri)
        let bod = JSON.stringify({
            'uris': [uri]
        });
        console.log(this.userData.accessToken)
        // console.log("bod" + bod)
        return fetch("https://api.spotify.com/v1/me/player/play", {
            method: "PUT",
            headers: {
                'Authorization': 'Bearer ' + this.userData.accessToken
            },
            body: bod
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>Accelerometer:</Text>
                <BPMComponent onBPMChange={this.handleBPMChange}></BPMComponent> 
                <Button title="Settings" onPress={() => this.props.navigation.navigate('Settings')}>Settings</Button>
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
export default HomeScreen