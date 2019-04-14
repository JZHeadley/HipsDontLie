import SettingsComponent from './settings/SettingsComponent.js';
import HomeScreen from './HomeScreen/HomeScreen.js';
import { createStackNavigator, createAppContainer } from "react-navigation";

const AppNavigator = createStackNavigator(
  {
    Home: {
      screen: HomeScreen, navigationOptions: {
        header: null,
      }
    },
    Settings: {
      screen: SettingsComponent, navigationOptions: {
        header: null,
      }
    }
  },
  {
    initialRoute: "Home"
  },

);

export default createAppContainer(AppNavigator);
