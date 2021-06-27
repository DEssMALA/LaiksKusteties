import React from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {ActivityIndicator, Text, withTheme, Title} from 'react-native-paper';

import FS from '../contexts/firestore';
import {AuthContext} from '../contexts/auth';

export default withTheme(({route, theme}) => {
  const exerciseType = route.params.id;
  const exerciseConfig = route.params.data;

  const {user} = React.useContext(AuthContext);

  const [loading, setLoading] = React.useState(true);
  const [exerciseData, setExerciseData] = React.useState();

  const timeStr = t => {
    const r = `${t.toLocaleTimeString()} ${('0' + t.getDate()).slice(-2)}.${(
      '0' +
      (t.getMonth() + 1)
    ).slice(-2)}.${t.getFullYear()}`;
    console.log(r);
    return r;
  };

  const singPlurChoser = (count, nameSing, namePlur) => {
    if (count % 10 == 1) return nameSing;
    else return namePlur;
  };

  React.useEffect(async () => {
    var exerscises = [];
    await FS.userExercises(user)
      .where('type', '==', exerciseType)
      .orderBy('started', 'asc')
      .get()
      .then(snap => {
        snap.forEach(d => {
          var data = d.data();
          if (data.started) data.started = data.started.toDate();
          if (data.finished) data.finished = data.finished.toDate();
          data.key = d.id;
          console.log(d);
          console.log(data);
          exerscises.push(data);
        });
      })
      .catch(e => {
        console.log(e);
      });
    setExerciseData(exerscises);
    setLoading(false);
  }, []);

  const {colors} = theme;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: colors.background,
      width: '100%',
    },
    titleText: {
      fontSize: 24,
      color: colors.primary,
      fontWeight: 'bold',
      marginVertical: 50,
    },
    itemBox: {
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
      backgroundColor: colors.primary,
    },
    text: {
      color: colors.background,
      fontSize: 18,
    },
    listItem: {
      width: '90%',
    },
  });

  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <Title style={styles.titleText}>
        Vēsture aktivitātei: {exerciseConfig.name}
      </Title>
      <FlatList
        data={exerciseData}
        renderItem={({item}) => {
          console.log('Flatlist item:', item);
          return (
            <View style={styles.itemBox}>
              <Text style={styles.text}>
                {timeStr(item.started)} - {item.count}{' '}
                {singPlurChoser(
                  item.count,
                  exerciseConfig.unitName.singular,
                  exerciseConfig.unitName.plural,
                )}{' '}
                - {item.count * exerciseConfig.pointsPerUnit}{' '}
                {singPlurChoser(
                  item.count * exerciseConfig.pointsPerUnit,
                  'punkts',
                  'punkti',
                )}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
});
