import remoteConfig from '@react-native-firebase/remote-config';

const setDefaults = async () => {
  return remoteConfig().setDefaults({
    exercises: undefined,
    enabled_exercises: undefined,
    colors: {
      white: '#FFFCEA',
      black: '#3F0E5E',
      accentA: '#775D8F',
      accentB: '#F5B975',
      accentC: '#FFF74F',
    },
    faq: undefined,
  });
};

export const fetch = async () => {
  console.log('remoteConfig:fetch');
  try {
    await setDefaults();
    await remoteConfig().fetch();
  } catch (e) {
    console.log(e);
  } finally {
    console.log('remoteConfig:activate');
    return remoteConfig().activate();
  }
};

// Use this function only in development
export const forceFetch = async (timeout = 0) => {
  console.log('remoteConfig:forceFetch fetch');
  try {
    await remoteConfig().fetch(timeout);
  } catch {
    e => {
      console.log(e);
    };
  } finally {
    console.log('remoteConfig:forceFetch activate');
    return remoteConfig().activate();
  }
};

export const get = key => {
  console.log('remoteConfig::get', key);
  const s = remoteConfig().getString(key);
  console.log('s:', s);
  const obj = JSON.parse(s);
  console.log('remoteConfig::get done');
  return obj;
};
