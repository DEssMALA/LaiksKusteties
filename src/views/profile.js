import React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  Text,
  Title,
  withTheme,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';

import {AuthContext} from '../contexts/auth';
import FS from '../contexts/firestore';
import {getTotalPoints} from '../contexts/bussinessLogic';

export default withTheme(({theme}) => {
  const [userInfo, setUserInfo] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [totalPoints, setTotalPoints] = React.useState(0);

  const {user, logout} = React.useContext(AuthContext);

  console.log('User info', userInfo);

  React.useEffect(() => {
    FS.user(user)
      .get()
      .then(snap => {
        setUserInfo(snap.data());
        setLoading(false);
      })
      .catch(e => {
        console.log(e);
      });
  }, []);

  React.useEffect(async () => {
    const points = await getTotalPoints(user);
    console.log('Today points:', points);
    setTotalPoints(points);
  }, []);

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
    },
    infoContainer: {
      margin: 10,
      width: '90%',
    },
    infoBox: {
      backgroundColor: colors.primary,
      marginVertical: 10,
      padding: 10,
    },
    infoText: {
      fontSize: 18,
      color: colors.background,
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
      <Title style={styles.titleText}>Profila informācija</Title>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <Text style={{...styles.infoText, fontWeight: 'bold'}}>
              Vārds: <Text style={styles.infoText}>{userInfo.name}</Text>
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={{...styles.infoText, fontWeight: 'bold'}}>
              Uzvārds: <Text style={styles.infoText}>{userInfo.surname}</Text>
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={{...styles.infoText, fontWeight: 'bold'}}>
              Epasts: <Text style={styles.infoText}>{userInfo.email}</Text>
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={{...styles.infoText, fontWeight: 'bold'}}>
              Kopā punkti: <Text style={styles.infoText}>{totalPoints}</Text>
            </Text>
          </View>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonBox}>
          <IconButton
            icon="logout"
            color={colors.background}
            onPress={() => {
              logout();
            }}
          />
        </View>
      </View>
    </View>
  );
});
