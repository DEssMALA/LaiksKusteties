import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, withTheme, Title, IconButton} from 'react-native-paper';

import {AuthContext} from '../contexts/auth';
import {
  getTodayPoints,
  getTodaySteps,
  saveDailySteps,
} from '../contexts/bussinessLogic';

export default withTheme(({navigation, theme}) => {
  const [todayPoints, setTodayPoints] = React.useState(0);
  const [todaySteps, setTodaySteps] = React.useState(0);
  const {user} = React.useContext(AuthContext);

  console.log('colors', colors);

  React.useEffect(async () => {
    const points = await getTodayPoints(user);
    console.log('Today points:', points);
    setTodayPoints(points);
  }, []);

  React.useEffect(async () => {
    const steps = await getTodaySteps();
    console.log('Today steps:', steps);
    setTodaySteps(steps);
  }, []);

  React.useEffect(async () => {
    await saveDailySteps(user);
  });

  const {colors} = theme;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    titleBox: {
      backgroundColor: colors.primary,
      margin: 10,
      padding: 30,
    },
    titleText: {
      fontSize: 38,
      lineHeight: 40,
      fontStyle: 'italic',
      color: colors.accent,
    },
    pointsText: {
      fontSize: 38,
      color: colors.accent,
      fontWeight: 'bold',
    },
    headingText: {
      fontWeight: 'bold',
      color: colors.notification,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      width: '100%',
    },
    buttonBox: {
      backgroundColor: colors.primary,
      borderRadius: 100,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.titleBox}>
        <Title style={styles.titleText}>Laiks kustēties!</Title>
      </View>
      <Text style={styles.headingText}>ŠODIEN SAVĀKTI PUNKTI</Text>
      <Text style={styles.pointsText}>{todayPoints}</Text>
      <Text style={styles.headingText}>ŠODIEN NOIETIE SOĻI</Text>
      <Text style={styles.pointsText}>{todaySteps}</Text>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonBox}>
          <IconButton
            icon="dumbbell"
            color={colors.background}
            onPress={() => {
              navigation.navigate('Exercises');
            }}
          />
        </View>
        <View style={styles.buttonBox}>
          <IconButton
            icon="frequently-asked-questions"
            color={colors.background}
            onPress={() => {
              navigation.navigate('FAQ');
            }}
          />
        </View>
        <View style={styles.buttonBox}>
          <IconButton
            icon="account"
            color={colors.background}
            onPress={() => {
              navigation.navigate('Profile');
            }}
          />
        </View>
        {/* <IconButton
        icon='reload'
          onPress={async () => {
            await forceFetch();
          }} /> */}
      </View>
    </View>
  );
});
