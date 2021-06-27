import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {createStackNavigator} from '@react-navigation/stack';
import {ActivityIndicator} from 'react-native-paper';

import {AuthContext} from './auth';
import Login from '../views/login';
import Home from '../views/home';
import Exercises from '../views/exercisesList';
import Exercise from '../views/exercise';
import ExerciseStats from '../views/exerciseStats';
import Faq from '../views/faq';
import Profile from '../views/profile';
import {forceFetch as remoteConfigFetch} from '../contexts/remoteConfig';

const PorchStack = createStackNavigator(); // When user is NOT logged in
const AppStack = createStackNavigator(); // When user is logged in

const Routes = () => {
  const {user, setUser} = React.useContext(AuthContext);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [confLoading, setConfLoading] = React.useState(true);

  const onAuthStateChanged = user => {
    setUser(user);
    setAuthLoading(false);
    console.log('Route: user set');
  };

  React.useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  React.useEffect(async () => {
    await remoteConfigFetch();
    setConfLoading(false);
    console.log('Route: config set');
  });

  if (authLoading || confLoading) return <ActivityIndicator />;
  return (
    <NavigationContainer>
      {user ? (
        <AppStack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <AppStack.Screen name="Home" component={Home} />
          <AppStack.Screen name="Exercises" component={Exercises} />
          <AppStack.Screen name="Exercise" component={Exercise} />
          <AppStack.Screen name="ExerciseStats" component={ExerciseStats} />
          <AppStack.Screen name="FAQ" component={Faq} />
          <AppStack.Screen name="Profile" component={Profile} />
        </AppStack.Navigator>
      ) : (
        <PorchStack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <PorchStack.Screen name="Login" component={Login} />
        </PorchStack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default Routes;
