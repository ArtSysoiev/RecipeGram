import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from "./Home/HomeScreen";
import LoginScreen from './LoginScreen';
import RegisterScreen from "./RegisterScreen";


export default function Index() {

    const Stack = createNativeStackNavigator();

    function RootStack() {
        return (
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }} />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="HomeScreen"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>

        );
    }

    return (
        <NavigationIndependentTree>
            <NavigationContainer>
                <RootStack />
            </NavigationContainer>
        </NavigationIndependentTree>
    )
}