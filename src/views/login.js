import React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  HelperText,
  withTheme,
  Title,
} from 'react-native-paper';

import {AuthContext} from '../contexts/auth';

export default withTheme(({theme}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [hidePassword, setHidePassword] = React.useState(true);
  const [helperText, setHelperText] = React.useState('');
  const [helperMode, setHelperMode] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const {login, passwordReset} = React.useContext(AuthContext);

  const setError = message => {
    setHelperText(message);
    setHelperMode('error');
  };

  const setInfo = message => {
    setHelperText(message);
    setHelperMode('info');
  };

  const resetHelper = () => {
    setHelperText('');
  };

  const handleLoginPress = async () => {
    console.log('Login button pressed');

    resetHelper();
    setLoading(true);

    // TODO: implement smarter validation with yup
    if (!password || !email) {
      setLoading(false);
      setError('Ievadi epastu un paroli');
      return;
    }

    try {
      const {user} = await login(email, password);
    } catch (e) {
      console.log(e);
      if (e.code === 'auth/invalid-email') setError('Lūdzu ievadi epastu');
      else if (e.code === 'auth/user-not-found')
        setError('Nav atrasts šāds lietotājs');
      else if (e.code === 'auth/wrong-password') setError('Nepareiza parole');
      else setError('Neizdevās ielogoties');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    console.log('Reset password pressed');

    resetHelper();
    setLoading(true);

    if (!email) {
      setError('Ievadi epastu');
      setLoading(false);
      return;
    }

    try {
      await passwordReset(email);
      setInfo('Epasts paroles atjaunošanai nosūtīts');
    } catch (e) {
      console.log(e);
      if (e.code === 'auth/invalid-email') setError('Lūdzu ievadi epastu');
      else if (e.code === 'auth/user-not-found')
        setError('Nav atrasts šāds lietotājs');
      else if (e.code === 'auth/wrong-password') setError('Nepareiza parole');
      else setError('Neizdevās nosūtīt atjaunojuma epastu');
    }

    setLoading(false);
  };

  const {colors} = theme;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    titleBox: {
      backgroundColor: colors.primary,
      marginVertical: 60,
      padding: 30,
    },
    titleText: {
      fontSize: 38,
      lineHeight: 40,
      fontStyle: 'italic',
      color: colors.accent,
    },
    loginBox: {
      width: '90%',
      alignItems: 'center',
    },
    input: {
      marginVertical: 10,
      width: '100%',
    },
    button: {
      width: '100%',
      marginVertical: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.titleBox}>
        <Title style={styles.titleText}>Laiks kustēties!</Title>
      </View>
      <View style={styles.loginBox}>
        <TextInput
          label="Epasts"
          value={email}
          style={styles.input}
          onChangeText={text => setEmail(text)}
        />
        <TextInput
          label="Parole"
          value={password}
          style={styles.input}
          onChangeText={password => {
            setPassword(password);
          }}
          secureTextEntry={hidePassword}
        />
        <HelperText type={helperMode} visible={helperText}>
          {helperText}
        </HelperText>
        <Button
          mode="contained"
          onPress={handleLoginPress}
          disabled={loading}
          style={styles.button}>
          Ienākt
        </Button>
        <Text
          onPress={handleResetPassword}
          disabled={loading}
          style={{
            color: colors.primary,
          }}>
          Ja aizmirsi paroli spied šeit.
        </Text>
        <Text>Ja tev nav lietotāja, prasi pētījuma komandai.</Text>
      </View>
    </View>
  );
});
