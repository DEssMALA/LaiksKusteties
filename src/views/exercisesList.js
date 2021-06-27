import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {Text, withTheme, Title} from 'react-native-paper';

import {get as getRemoteConfig} from '../contexts/remoteConfig';

export default withTheme(({navigation, theme}) => {
  const exercises = getRemoteConfig('exercises');
  const exerciseIDs = getRemoteConfig('enabled_exercises');

  console.log(exerciseIDs);
  console.log(exercises);

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

  return (
    <View style={styles.container}>
      <Title style={styles.titleText}>Aktivitātes</Title>
      <FlatList
        style={{
          width: '100%',
        }}
        data={Object.values(exercises)}
        keyExtractor={item => item.id}
        renderItem={({item}) => {
          console.log(item);
          return (
            <TouchableOpacity
              style={styles.listItem}
              style={styles.itemBox}
              onPress={() => {
                console.log(`Pressed ${item.name}`);
                navigation.navigate('Exercise', {
                  id: item.id,
                  data: item,
                });
              }}>
              <Text style={styles.text}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  itemBox: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: 'blue',
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
});
