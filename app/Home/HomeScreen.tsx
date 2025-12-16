import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import NewRecipeTab from './NewRecipeTab';


function HomeFeed() {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.text}>Your Recipes Feed</Text>
    </View>
  );
}


function UserProfile() {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.text}>My Profile</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'New Recipe') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2326f7ff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
            height: 60,
            paddingBottom: 10,
            paddingTop: 5
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeFeed} />
      <Tab.Screen name="New Recipe" component={NewRecipeTab} />
      <Tab.Screen name="Profile" component={UserProfile} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dde8ffff'
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  }
});