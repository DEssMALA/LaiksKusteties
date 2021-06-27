import React from 'react';
import {View, NativeEventEmitter, StyleSheet} from 'react-native';
import {Button, Text, withTheme, Title} from 'react-native-paper';

import KotlinHARManager from '../contexts/rnBridge';
import FS from '../contexts/firestore';
import {AuthContext} from '../contexts/auth';

export default withTheme(({route, navigation, theme}) => {
  const exerciseType = route.params.id;
  const exerciseConfig = route.params.data;

  const [exerciseRunning, setExerciseRunning] = React.useState(false);
  const [exerciseID, setExerciseID] = React.useState(undefined);
  const [count, setCount] = React.useState(0);

  const {user} = React.useContext(AuthContext);

  React.useEffect(() => {
    const eventEmitter = new NativeEventEmitter(KotlinHARManager);
    const eventListener = eventEmitter.addListener('ClassifiedHAR', event => {
      console.log(event);
      if (event['0']) {
        var c = 0;
        if (event['0'] > 0.5) c += 1;
        if (event['1'] > 0.5) c += 1;
        if (event['2'] > 0.5) c += 1;
        if (event['3'] > 0.5) c += 1;
        if (c) setCount(count + c);
      }
    });
    console.log('eventListener added');
    return () => {
      console.log('eventListener removed');
      eventListener.remove();
    };
  }, []);

  const startExercise = async () => {
    console.log('startExercise');

    setCount(0);

    KotlinHARManager.start(1, () => {
      console.log('Android HAR started:');
    });

    console.log(FS.userExercises(user).path);
    await FS.userExercises(user)
      .add({
        type: exerciseType,
        started: FS.serverTimestamp(),
      })
      .then(ref => {
        console.log('wrote successfuly');
        console.log(ref.id);
        setExerciseID(ref.id);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const stopExercise = () => {
    KotlinHARManager.stop(() => {
      console.log('stoped');
    });
    // If nothing was done, remove the record of this exercise
    if (!count && exerciseID) {
      FS.userExercises(user)
        .doc(exerciseID)
        .delete()
        .then(() => {
          console.log('Exercise document deleted successfuly');
        })
        .catch(e => {
          console.log(e);
        });
    } else if (exerciseID) {
      FS.userExercises(user)
        .doc(exerciseID)
        .set(
          {
            finished: FS.serverTimestamp(),
            count: count,
          },
          {
            merge: true,
          },
        )
        .then(() => {
          console.log('Exercise document updated successfuly');
        })
        .catch(e => {
          console.log(e);
        });
    }
  };

  const onButtonPress = () => {
    if (exerciseRunning) {
      stopExercise();
      setExerciseRunning(false);
    } else {
      startExercise();
      setExerciseRunning(true);
    }
  };

  console.log(exerciseConfig);

  const {colors} = theme;
  console.log('colors', colors);
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    titleText: {
      fontSize: 24,
      color: colors.primary,
      fontWeight: 'bold',
    },
    infoBox: {
      backgroundColor: colors.primary,
      marginVertical: 10,
      padding: 20,
      width: '70%',
    },
    infoText: {
      fontSize: 18,
      color: colors.background,
    },
    countBox: {
      borderRadius: 100,
      backgroundColor: colors.accent,
      width: 200,
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
    },
    countText: {
      fontSize: 58,
      fontWeight: 'bold',
      color: colors.background,
    },
    button: {
      borderRadius: 100,
      width: 80,
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Title style={styles.titleText}>{exerciseConfig.name}</Title>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>{exerciseConfig.infoText}</Text>
      </View>
      <View style={styles.countBox}>
        <Text style={styles.countText}>{count}</Text>
      </View>

      <Button onPress={onButtonPress} mode="contained" style={styles.button}>
        {exerciseRunning ? `Stop` : `Start`}
      </Button>

      <Button
        onPress={() => {
          navigation.navigate('ExerciseStats', {
            id: exerciseType,
            data: exerciseConfig,
          });
        }}>
        Vēsture
      </Button>
    </View>
  );
});
