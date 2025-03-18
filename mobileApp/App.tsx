// mobileApp/App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalendarScreen from './src/todo/CalenderScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={CalendarScreen} />
        {/* 추후 다른 화면이 추가되면 여기에 Stack.Screen 추가 가능 */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;