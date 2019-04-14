import SettingsComponent from './settings/SettingsComponent.js';
import HomeScreen from './HomeScreen/HomeScreen.js';
import { createStackNavigator, createAppContainer } from "react-navigation";

const AppNavigator = createStackNavigator(
  {
    Home: { screen: HomeScreen },
    Settings: { screen: SettingsComponent }
  },
  {
    initialRoute: "Home"
  }
);

export default createAppContainer(AppNavigator);
