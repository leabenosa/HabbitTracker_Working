import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, View } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import AddHabitScreen from './screens/AddHabitScreen';
import DoneScreen from './screens/DoneScreen';
import UndoneScreen from './screens/UndoneScreen';
import ProfileScreen from './screens/ProfileScreen';

export type RootTabParamList = {
  Home: undefined;
  Add: undefined;
  Done: undefined;
  Undone: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const darkViolet = '#0e0522ff';
const lightViolet = '#50406eff';
const backgroundViolet = '#f5eefc';


type TabBarIconProps = {
  source: any;
  focused: boolean;
  size: number;
  tintColor?: string;
  isAdd?: boolean;
};

function AnimatedTabIcon({ source, focused, size, tintColor, isAdd }: TabBarIconProps) {
  const scale = useRef(new Animated.Value(focused ? 1.2 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.2 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  if (isAdd) {
    return (
      <View
        style={{
          backgroundColor: darkViolet,
          padding: focused ? 18 : 14,
          borderRadius: 40,
          marginTop: -30,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 6,
        }}
      >
        <Animated.Image
          source={source}
          style={{
            width: 34,
            height: 34,
            resizeMode: 'contain',
           
            transform: [{ scale }],
          }}
        />
      </View>
    );
  }

  return (
    <Animated.Image
      source={source}
      style={{
        width: size,
        height: size,
        resizeMode: 'contain',
        transform: [{ scale }],
      }}
    />
  );
}


export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: darkViolet,
          tabBarInactiveTintColor: lightViolet,
          tabBarStyle: {
            backgroundColor: backgroundViolet,
            height: 70,
            position: 'absolute',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 6,
          },
          tabBarIcon: ({ focused, color }) => {
            let iconPath;

            switch (route.name) {
              case 'Home':
                iconPath = focused
                  ? require('./assets/icons/home-filled.png')
                  : require('./assets/icons/home-outline.png');
                break;
              case 'Add':
                iconPath = focused
                  ? require('./assets/icons/add-filled.png')
                  : require('./assets/icons/add-outline.png');
                break;
              case 'Done':
                iconPath = focused
                  ? require('./assets/icons/done-filled.png')
                  : require('./assets/icons/done-outline.png');
                break;
              case 'Undone':
                iconPath = focused
                  ? require('./assets/icons/undone-filled.png')
                  : require('./assets/icons/undone-outline.png');
                break;
              case 'Profile':
                iconPath = focused
                  ? require('./assets/icons/profile-filled.png')
                  : require('./assets/icons/profile-outline.png');
                break;
            }

            return (
              <AnimatedTabIcon
                source={iconPath}
                focused={focused}
                size={32}
                tintColor={color}
                isAdd={route.name === 'Add'}
              />
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Done" component={DoneScreen} />
        <Tab.Screen name="Add" component={AddHabitScreen} />
        <Tab.Screen name="Undone" component={UndoneScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
