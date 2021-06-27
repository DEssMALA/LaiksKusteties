import React from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import {Text, withTheme, Title} from 'react-native-paper';

import {get as getRemoteConfig} from '../contexts/remoteConfig';

export default withTheme(({theme}) => {
  const qa = getRemoteConfig('faq');

  console.log(qa);

  const {colors} = theme;
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
      marginVertical: 50,
    },
    itemBox: {
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
      backgroundColor: colors.primary,
    },
    textQ: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    textA: {
      color: colors.background,
      fontSize: 14,
    },
  });

  return (
    <View style={styles.container}>
      <Title style={styles.titleText}>Jautājumi un atbildes</Title>
      <FlatList
        data={qa}
        keyExtractor={(item, index) => {
          return 'faq_' + index;
        }}
        renderItem={({item}) => {
          console.log(item);
          return (
            <View style={styles.itemBox}>
              <Text style={styles.textQ}>{item.q}</Text>
              <Text style={styles.textA}>{item.a}</Text>
            </View>
          );
        }}
      />
    </View>
  );
});
